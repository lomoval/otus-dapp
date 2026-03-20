use near_sdk::{near, AccountId};

#[near(contract_state)]
pub struct Verifier {}

impl Default for Verifier {
    fn default() -> Self {
        Self {}
    }
}

#[near]
impl Verifier {
    pub fn verify(&self, account_id: AccountId) -> bool {
        let name = account_id.as_str();
        if name.len() <= 2 {
            return false;
        }

        name.chars().all(|c| c.is_alphanumeric() || c == '.' || c == '-' || c == '_')
    }
}
