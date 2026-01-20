pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("9RGwo1Eekh1X96WiBEaob2bn6pS7iuunma21eyHbeX1Q");

#[program]
pub mod lottery {
    use super::*;

    pub fn claim(ctx: Context<Claim>, id: u64) -> Result<()> {
        claim::handler(ctx, id)
    }

    pub fn initialize(ctx: Context<Initialize>, id: u64) -> Result<()> {
        initialize::handler(ctx, id)
    }

    pub fn purchase(ctx: Context<Purchase>, id: u64, numbers: [u8; 6]) -> Result<()> {
        purchase::handler(ctx, id, numbers)
    }

    pub fn draw(ctx: Context<Draw>, id: u64) -> Result<()> {
        draw::handler(ctx, id)
    }
}
