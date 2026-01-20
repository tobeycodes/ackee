import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Lottery } from "../target/types/lottery";
import { assert } from "chai";

describe("Lottery", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.lottery as Program<Lottery>;

  const admin = anchor.web3.Keypair.generate();
  const admin2 = anchor.web3.Keypair.generate();

  const lotteryId = new anchor.BN(1);
  const lotteryId2 = new anchor.BN(2);
  const lotteryId3 = new anchor.BN(3);

  const [lotteryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("lottery"), lotteryId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [lottery2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("lottery"), lotteryId2.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [lottery3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("lottery"), lotteryId3.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const winner = anchor.web3.Keypair.generate();
  const loser = anchor.web3.Keypair.generate();
  const testUser = anchor.web3.Keypair.generate();
  const anotherUser = anchor.web3.Keypair.generate();

  const [winnerTicketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("ticket"), lotteryPda.toBuffer(), winner.publicKey.toBuffer()],
    program.programId
  );

  const [loserTicketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("ticket"), lotteryPda.toBuffer(), loser.publicKey.toBuffer()],
    program.programId
  );

  const [testUserTicket2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      lottery2Pda.toBuffer(),
      testUser.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [testUserTicket3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      lottery3Pda.toBuffer(),
      testUser.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [anotherUserTicket3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      lottery3Pda.toBuffer(),
      anotherUser.publicKey.toBuffer(),
    ],
    program.programId
  );

  it("Should pass to initialize lottery", async () => {
    await requestAirdrop(admin);

    await program.methods
      .initialize(lotteryId)
      .accountsStrict({
        authority: admin.publicKey,
        lottery: lotteryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const lottery = await program.account.lottery.fetch(lotteryPda);

    assert.equal(lottery.authority.toString(), admin.publicKey.toString());
    assert.equal(lottery.id.toString(), lotteryId.toString());
    assert.equal(lottery.holders.length, 0);
    assert.equal(lottery.sold, 0);
    assert.equal(lottery.price.toString(), "1000000");
    assert.equal(lottery.isActive, true);
    assert.equal(lottery.isClaimed, false);
    assert.equal(lottery.numbers, null);
  });

  it("Should fail to initialize same lottery ID twice", async () => {
    try {
      await program.methods
        .initialize(lotteryId)
        .accountsStrict({
          authority: admin.publicKey,
          lottery: lotteryPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "already in use");
    }
  });

  it("Purchase winning ticket", async () => {
    await requestAirdrop(winner);

    const initialLottery = await program.account.lottery.fetch(lotteryPda);
    const initialSold = initialLottery.sold;

    await program.methods
      .purchase(lotteryId, [1, 2, 3, 4, 5, 6])
      .accountsStrict({
        authority: winner.publicKey,
        lottery: lotteryPda,
        ticket: winnerTicketPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([winner])
      .rpc();

    const lottery = await program.account.lottery.fetch(lotteryPda);
    const ticket = await program.account.ticket.fetch(winnerTicketPda);

    assert.equal(lottery.sold, initialSold + 1);
    assert.equal(lottery.holders.length, 1);
    assert.equal(lottery.holders[0].toString(), winnerTicketPda.toString());
    assert.deepEqual(ticket.numbers, [1, 2, 3, 4, 5, 6]);
  });

  it("Purchase losing ticket", async () => {
    await requestAirdrop(loser);

    const initialLottery = await program.account.lottery.fetch(lotteryPda);
    const initialSold = initialLottery.sold;

    await program.methods
      .purchase(lotteryId, [7, 8, 9, 10, 1, 2])
      .accountsStrict({
        authority: loser.publicKey,
        lottery: lotteryPda,
        ticket: loserTicketPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([loser])
      .rpc();

    const lottery = await program.account.lottery.fetch(lotteryPda);
    const ticket = await program.account.ticket.fetch(loserTicketPda);

    assert.equal(lottery.sold, initialSold + 1);
    assert.equal(lottery.holders.length, 2);
    assert.deepEqual(ticket.numbers, [7, 8, 9, 10, 1, 2]);
  });

  it("Should fail when loser tries to draw", async () => {
    try {
      await program.methods
        .draw(lotteryId)
        .accountsStrict({
          authority: loser.publicKey,
          lottery: lotteryPda,
        })
        .signers([loser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "ConstraintHasOne");
    }
  });

  it("Should pass when admin tries to draw", async () => {
    await program.methods
      .draw(lotteryId)
      .accountsStrict({
        authority: admin.publicKey,
        lottery: lotteryPda,
      })
      .signers([admin])
      .rpc();

    const lottery = await program.account.lottery.fetch(lotteryPda);

    assert.equal(lottery.isActive, false);
    assert.isNotNull(lottery.numbers);
    assert.equal(lottery.numbers.length, 6);

    for (const number of lottery.numbers) {
      assert.isAtLeast(number, 1);
      assert.isAtMost(number, 10);
    }
  });

  it("Should fail when loser tries to claim", async () => {
    try {
      await program.methods
        .claim(lotteryId)
        .accountsStrict({
          authority: loser.publicKey,
          lottery: lotteryPda,
          ticket: loserTicketPda,
        })
        .signers([loser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryNumbersDoNotMatch");
    }
  });

  it("Should pass when winner tries to claim", async () => {
    const provider = anchor.getProvider() as anchor.AnchorProvider;

    const initialWinnerBalance = await provider.connection.getBalance(
      winner.publicKey
    );
    const initialLotteryBalance = await provider.connection.getBalance(
      lotteryPda
    );

    await program.methods
      .claim(lotteryId)
      .accountsStrict({
        authority: winner.publicKey,
        lottery: lotteryPda,
        ticket: winnerTicketPda,
      })
      .signers([winner])
      .rpc();

    const lottery = await program.account.lottery.fetch(lotteryPda);
    const finalWinnerBalance = await provider.connection.getBalance(
      winner.publicKey
    );
    const finalLotteryBalance = await provider.connection.getBalance(
      lotteryPda
    );

    assert.equal(lottery.isClaimed, true);
    assert.isTrue(finalWinnerBalance > initialWinnerBalance);
    assert.isTrue(finalLotteryBalance < initialLotteryBalance);
  });

  it("Should fail when winner tries to claim twice", async () => {
    try {
      await program.methods
        .claim(lotteryId)
        .accountsStrict({
          authority: winner.publicKey,
          lottery: lotteryPda,
          ticket: winnerTicketPda,
        })
        .signers([winner])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryAlreadyClaimed");
    }
  });

  it("Should fail to purchase with invalid numbers (too low)", async () => {
    await requestAirdrop(admin2);
    await requestAirdrop(testUser);

    await program.methods
      .initialize(lotteryId2)
      .accountsStrict({
        authority: admin2.publicKey,
        lottery: lottery2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin2])
      .rpc();

    try {
      await program.methods
        .purchase(lotteryId2, [0, 1, 2, 3, 4, 5])
        .accountsStrict({
          authority: testUser.publicKey,
          lottery: lottery2Pda,
          ticket: testUserTicket2Pda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testUser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryInvalidNumbers");
    }
  });

  it("Should fail to purchase with invalid numbers (too high)", async () => {
    try {
      await program.methods
        .purchase(lotteryId2, [11, 1, 2, 3, 4, 5])
        .accountsStrict({
          authority: testUser.publicKey,
          lottery: lottery2Pda,
          ticket: testUserTicket2Pda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testUser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryInvalidNumbers");
    }
  });

  it("Should fail to purchase with duplicate numbers", async () => {
    try {
      await program.methods
        .purchase(lotteryId2, [1, 1, 2, 3, 4, 5])
        .accountsStrict({
          authority: testUser.publicKey,
          lottery: lottery2Pda,
          ticket: testUserTicket2Pda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testUser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryInvalidNumbers");
    }
  });

  it("Should fail to draw with no tickets sold", async () => {
    try {
      await program.methods
        .draw(lotteryId2)
        .accountsStrict({
          authority: admin2.publicKey,
          lottery: lottery2Pda,
        })
        .signers([admin2])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryNoTicketsSold");
    }
  });

  it("Should fail to claim before draw", async () => {
    await program.methods
      .purchase(lotteryId2, [1, 2, 3, 4, 5, 6])
      .accountsStrict({
        authority: testUser.publicKey,
        lottery: lottery2Pda,
        ticket: testUserTicket2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser])
      .rpc();

    try {
      await program.methods
        .claim(lotteryId2)
        .accountsStrict({
          authority: testUser.publicKey,
          lottery: lottery2Pda,
          ticket: testUserTicket2Pda,
        })
        .signers([testUser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryIsActive");
    }
  });

  it("Should fail to purchase after draw", async () => {
    await program.methods
      .draw(lotteryId2)
      .accountsStrict({
        authority: admin2.publicKey,
        lottery: lottery2Pda,
      })
      .signers([admin2])
      .rpc();

    const anotherTestUser = anchor.web3.Keypair.generate();
    await requestAirdrop(anotherTestUser);

    const [anotherTestUserTicketPda] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("ticket"),
          lottery2Pda.toBuffer(),
          anotherTestUser.publicKey.toBuffer(),
        ],
        program.programId
      );

    try {
      await program.methods
        .purchase(lotteryId2, [7, 8, 9, 10, 1, 2])
        .accountsStrict({
          authority: anotherTestUser.publicKey,
          lottery: lottery2Pda,
          ticket: anotherTestUserTicketPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([anotherTestUser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "LotteryNotActive");
    }
  });

  it("Should fail to claim with wrong user's ticket", async () => {
    await requestAirdrop(anotherUser);

    await program.methods
      .initialize(lotteryId3)
      .accountsStrict({
        authority: admin2.publicKey,
        lottery: lottery3Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin2])
      .rpc();

    await program.methods
      .purchase(lotteryId3, [1, 2, 3, 4, 5, 6])
      .accountsStrict({
        authority: testUser.publicKey,
        lottery: lottery3Pda,
        ticket: testUserTicket3Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([testUser])
      .rpc();

    await program.methods
      .purchase(lotteryId3, [7, 8, 9, 10, 1, 2])
      .accountsStrict({
        authority: anotherUser.publicKey,
        lottery: lottery3Pda,
        ticket: anotherUserTicket3Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([anotherUser])
      .rpc();

    await program.methods
      .draw(lotteryId3)
      .accountsStrict({
        authority: admin2.publicKey,
        lottery: lottery3Pda,
      })
      .signers([admin2])
      .rpc();

    try {
      await program.methods
        .claim(lotteryId3)
        .accountsStrict({
          authority: anotherUser.publicKey,
          lottery: lottery3Pda,
          ticket: testUserTicket3Pda,
        })
        .signers([anotherUser])
        .rpc();

      assert.fail("Expected transaction to fail");
    } catch (error) {
      assert.include(error.message, "ConstraintSeeds");
    }
  });
});

const requestAirdrop = async (authority: anchor.web3.Keypair) => {
  const provider = anchor.getProvider() as anchor.AnchorProvider;

  const blockhash = (await provider.connection.getLatestBlockhash()).blockhash;

  const lastValidBlockHeight = await provider.connection.getBlockHeight();

  const signature = await provider.connection.requestAirdrop(
    authority.publicKey,
    2 * anchor.web3.LAMPORTS_PER_SOL
  );

  await provider.connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight,
  });
};

