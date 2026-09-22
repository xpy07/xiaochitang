#![allow(dead_code)]
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SceneMode {
    Pond,
    Immersive,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PondShape {
    Circle,
    Oval,
    Irregular,
    RoundedRect,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneConfig {
    pub mode: SceneMode,
    pub pond_shape: PondShape,
}

impl Default for SceneConfig {
    fn default() -> Self {
        Self {
            mode: SceneMode::Pond,
            pond_shape: PondShape::Circle,
        }
    }
}
