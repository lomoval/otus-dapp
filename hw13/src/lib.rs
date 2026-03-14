use near_sdk::store::Vector;
use near_sdk::{env, near};

#[near(contract_state)]
pub struct MessageBoard {
    messages: Vector<String>,
}

impl Default for MessageBoard {
    fn default() -> Self {
        Self {
            messages: Vector::new(b"m"),
        }
    }
}

#[near]
impl MessageBoard {
    pub fn add_message(&mut self, text: String) {
        let sender = env::predecessor_account_id();
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_has_no_messages() {
        let contract = MessageBoard::default();
        assert_eq!(contract.total_messages(), 0);
    }

    #[test]
    fn test_add_and_get_messages() {
        let mut contract = MessageBoard::default();
        contract.add_message("Hello NEAR!".to_string());
        contract.add_message("Second message".to_string());

        assert_eq!(contract.total_messages(), 2);

        let msgs = contract.get_messages(0, 10);
        assert_eq!(msgs.len(), 2);
        assert!(msgs[0].contains("Hello NEAR!"));
        assert!(msgs[1].contains("Second message"));
    }

    #[test]
    fn test_get_messages_pagination() {
        let mut contract = MessageBoard::default();
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
        let mut contract = MessageBoard::default();
        contract.add_message("Only one".to_string());

        let msgs = contract.get_messages(5, 10);
        assert_eq!(msgs.len(), 0);
    }
}
