use near_sdk::store::LookupMap;
use near_sdk::store::Vector;
use near_sdk::{env, ext_contract, near, AccountId, Gas, NearToken, Promise, PromiseError};

const VERIFY_GAS: Gas = Gas::from_tgas(5);
const CALLBACK_GAS: Gas = Gas::from_tgas(15);

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug, PartialEq)]
pub enum VerificationStatus {
    Pending,
    Verified,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug)]
pub struct UserInfo {
    pub status: VerificationStatus,
    pub storage_deposit: NearToken,
    pub registered_at: u64,
}

#[ext_contract(ext_verifier)]
pub trait VerifierContract {
    fn verify(&self, account_id: AccountId) -> bool;
}

#[near(contract_state)]
pub struct MessageBoard {
    messages: Vector<String>,
    users: LookupMap<AccountId, UserInfo>,
    verifier_id: AccountId,
}

impl Default for MessageBoard {
    fn default() -> Self {
        Self {
            messages: Vector::new(b"m"),
            users: LookupMap::new(b"u"),
            verifier_id: "verifier.testnet".parse().unwrap(),
        }
    }
}

#[near]
impl MessageBoard {
    #[init]
    pub fn new(verifier_id: AccountId) -> Self {
        Self {
            messages: Vector::new(b"m"),
            users: LookupMap::new(b"u"),
            verifier_id,
        }
    }

    #[payable]
    pub fn register(&mut self) -> Promise {
        let account_id = env::predecessor_account_id();
        let deposit = env::attached_deposit();

        assert!(
            self.users.get(&account_id).is_none(),
            "User already registered"
        );

        let storage_before = env::storage_usage();

        self.users.insert(
            account_id.clone(),
            UserInfo {
                status: VerificationStatus::Pending,
                storage_deposit: deposit,
                registered_at: env::block_timestamp(),
            },
        );

        self.users.flush();
        let storage_after = env::storage_usage();
        let storage_used = storage_after - storage_before;
        let required_deposit = env::storage_byte_cost()
            .saturating_mul(storage_used as u128);

        assert!(
            deposit >= required_deposit,
            "Insufficient deposit. Required: {}, attached: {}",
            required_deposit,
            deposit
        );

        near_sdk::log!(
            "register: account={}, deposit={}, storage_cost={}, gas_used={:?}",
            account_id,
            deposit,
            required_deposit,
            env::used_gas()
        );

        ext_verifier::ext(self.verifier_id.clone())
            .with_static_gas(VERIFY_GAS)
            .verify(account_id.clone())
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(CALLBACK_GAS)
                    .on_verify_complete(account_id, required_deposit),
            )
    }

    #[private]
    pub fn on_verify_complete(
        &mut self,
        account_id: AccountId,
        storage_cost: NearToken,
        #[callback_result] call_result: Result<bool, PromiseError>,
    ) -> bool {
        near_sdk::log!(
            "on_verify_complete: account={}, gas_used={:?}",
            account_id,
            env::used_gas()
        );

        match call_result {
            Ok(true) => {
                if let Some(user) = self.users.get_mut(&account_id) {
                    user.status = VerificationStatus::Verified;

                    let refund = user
                        .storage_deposit
                        .checked_sub(storage_cost)
                        .unwrap_or(NearToken::from_yoctonear(0));
                    if refund > NearToken::from_yoctonear(0) {
                        near_sdk::log!("Refunding: {} to {}", refund, account_id);
                        Promise::new(account_id).transfer(refund).detach();
                    }
                    true
                } else {
                    false
                }
            }
            Ok(false) | Err(_) => {
                if let Some(user) = self.users.remove(&account_id) {
                    near_sdk::log!(
                        "Verification failed, refunding full deposit: {} to {}",
                        user.storage_deposit,
                        account_id
                    );
                    Promise::new(account_id).transfer(user.storage_deposit).detach();
                }
                false
            }
        }
    }

    // === Message Board ===

    pub fn add_message(&mut self, text: String) {
        let sender = env::predecessor_account_id();

        let user = self
            .users
            .get(&sender)
            .expect("User not registered. Call register() first.");

        assert!(
            user.status == VerificationStatus::Verified,
            "User not verified yet. Wait for verification to complete."
        );

        let entry = format!("{}: {}", sender, text);
        self.messages.push(entry);
    }

    pub fn get_messages(&self, from_index: u32, limit: u32) -> Vec<&String> {
        self.messages
            .iter()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }

    pub fn total_messages(&self) -> u32 {
        self.messages.len()
    }

    // === User Management ===

    pub fn unregister(&mut self) -> Promise {
        let account_id = env::predecessor_account_id();

        let user = self
            .users
            .get(&account_id)
            .expect("User not registered");

        assert!(
            user.status != VerificationStatus::Pending,
            "Cannot unregister while verification is pending"
        );

        let refund = user.storage_deposit;
        self.users.remove(&account_id);

        near_sdk::log!("Unregistered: {}, refunding: {}", account_id, refund);

        Promise::new(account_id).transfer(refund)
    }

    // === View Methods ===

    pub fn storage_balance_of(&self, account_id: AccountId) -> Option<NearToken> {
        self.users.get(&account_id).map(|u| u.storage_deposit)
    }

    pub fn is_registered(&self, account_id: AccountId) -> bool {
        self.users.get(&account_id).is_some()
    }

    pub fn get_user_status(&self, account_id: AccountId) -> Option<VerificationStatus> {
        self.users.get(&account_id).map(|u| u.status.clone())
    }

    pub fn get_verifier_id(&self) -> AccountId {
        self.verifier_id.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    const CONTRACT_ACCOUNT: &str = "messageboard.testnet";
    const VERIFIER_ACCOUNT: &str = "verifier.testnet";

    fn setup_context(predecessor: &str, deposit: NearToken) {
        let context = VMContextBuilder::new()
            .predecessor_account_id(predecessor.parse().unwrap())
            .current_account_id(CONTRACT_ACCOUNT.parse().unwrap())
            .attached_deposit(deposit)
            .is_view(false)
            .build();
        testing_env!(context);
    }

    fn setup_contract() -> MessageBoard {
        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        MessageBoard::new(VERIFIER_ACCOUNT.parse().unwrap())
    }

    fn register_user(contract: &mut MessageBoard, account: &str) {
        setup_context(account, NearToken::from_millinear(50));
        let _ = contract.register();
    }

    fn verify_user(contract: &mut MessageBoard, account: &str, result: Result<bool, PromiseError>) {
        setup_context(CONTRACT_ACCOUNT, NearToken::from_yoctonear(0));
        contract.on_verify_complete(
            account.parse().unwrap(),
            NearToken::from_yoctonear(0),
            result
        );
    }

    #[test]
    fn test_default_has_no_messages() {
        let contract = setup_contract();
        assert_eq!(contract.total_messages(), 0);
    }

    #[test]
    fn test_get_messages_pagination() {
        let mut contract = setup_contract();

        register_user(&mut contract, "alice.testnet");
        verify_user(&mut contract, "alice.testnet", Ok(true));

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        for i in 0..5 {
            contract.add_message(format!("Message {}", i));
        }

        let page = contract.get_messages(2, 2);
        assert_eq!(page.len(), 2);
        assert!(page[0].contains("Message 2"));
        assert!(page[1].contains("Message 3"));
    }

    #[test]
    fn test_get_messages_beyond_range() {
        let mut contract = setup_contract();

        register_user(&mut contract, "alice.testnet");
        verify_user(&mut contract, "alice.testnet", Ok(true));

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        contract.add_message("Only one".to_string());

        let msgs = contract.get_messages(5, 10);
        assert_eq!(msgs.len(), 0);
    }

    // === Registration tests ===

    #[test]
    fn test_register_with_sufficient_deposit() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        assert!(contract.is_registered("alice.testnet".parse().unwrap()));
        assert_eq!(
            contract.get_user_status("alice.testnet".parse().unwrap()),
            Some(VerificationStatus::Pending)
        );
    }

    #[test]
    #[should_panic(expected = "Insufficient deposit")]
    fn test_register_with_insufficient_deposit() {
        let mut contract = setup_contract();
        setup_context("alice.testnet", NearToken::from_yoctonear(1));
        let _ = contract.register();
    }

    #[test]
    #[should_panic(expected = "User already registered")]
    fn test_double_registration() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");
        register_user(&mut contract, "alice.testnet");
    }

    // === Callback tests ===

    #[test]
    fn test_on_verify_complete_success() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        verify_user(&mut contract, "alice.testnet", Ok(true));

        assert_eq!(
            contract.get_user_status("alice.testnet".parse().unwrap()),
            Some(VerificationStatus::Verified)
        );
    }

    #[test]
    fn test_on_verify_complete_rejected() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        verify_user(&mut contract, "alice.testnet", Ok(false));

        assert!(!contract.is_registered("alice.testnet".parse().unwrap()));
    }

    #[test]
    fn test_on_verify_complete_promise_failed() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        verify_user(&mut contract, "alice.testnet", Err(PromiseError::Failed));

        assert!(!contract.is_registered("alice.testnet".parse().unwrap()));
    }

    // === add_message access control ===

    #[test]
    fn test_add_message_verified_user() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");
        verify_user(&mut contract, "alice.testnet", Ok(true));

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        contract.add_message("Hello!".to_string());

        assert_eq!(contract.total_messages(), 1);
        let msgs = contract.get_messages(0, 10);
        assert!(msgs[0].contains("Hello!"));
    }

    #[test]
    #[should_panic(expected = "User not registered")]
    fn test_add_message_unregistered_user() {
        let mut contract = setup_contract();
        setup_context("bob.testnet", NearToken::from_yoctonear(0));
        contract.add_message("Should fail".to_string());
    }

    #[test]
    #[should_panic(expected = "User not verified yet")]
    fn test_add_message_pending_user() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        contract.add_message("Should fail".to_string());
    }

    // === Unregister tests ===

    #[test]
    fn test_unregister_verified_user() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");
        verify_user(&mut contract, "alice.testnet", Ok(true));

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        let _ = contract.unregister();

        assert!(!contract.is_registered("alice.testnet".parse().unwrap()));
    }

    #[test]
    #[should_panic(expected = "Cannot unregister while verification is pending")]
    fn test_unregister_pending_user() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        let _ = contract.unregister();
    }

    // === View method tests ===

    #[test]
    fn test_storage_balance_of() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");

        let balance = contract.storage_balance_of("alice.testnet".parse().unwrap());
        assert!(balance.is_some());
        assert!(balance.unwrap() > NearToken::from_yoctonear(0));

        let no_balance = contract.storage_balance_of("bob.testnet".parse().unwrap());
        assert!(no_balance.is_none());
    }

    #[test]
    fn test_existing_pagination_still_works() {
        let mut contract = setup_contract();
        register_user(&mut contract, "alice.testnet");
        verify_user(&mut contract, "alice.testnet", Ok(true));

        setup_context("alice.testnet", NearToken::from_yoctonear(0));
        contract.add_message("Привет NEAR!".to_string());
        contract.add_message("Тестовое сообщение".to_string());

        assert_eq!(contract.total_messages(), 2);

        let msgs = contract.get_messages(0, 10);
        assert_eq!(msgs.len(), 2);
        assert!(msgs[0].contains("Привет NEAR!"));
        assert!(msgs[1].contains("Тестовое сообщение"));
    }
}
