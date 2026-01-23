use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UiState {
    pub sidebar_open: bool,
    pub sidebar_width: f64,
}

impl Default for UiState {
    fn default() -> Self {
        Self {
            sidebar_open: true,
            sidebar_width: 260.0,
        }
    }
}
