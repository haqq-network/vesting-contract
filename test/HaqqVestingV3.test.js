import chai, {expect} from 'chai';
import {ethers} from "hardhat";
import {solidity} from "ethereum-waffle";

chai.use(solidity);

const contractName = 'HaqqVestingV3';

describe("HaqqVestingV3", function () {
    let HaqqVestingV2, haqqVesting, owner, addr1;

    const depositors = ['0x098583d8bb37eb649538aee13a56bae41950aa65', '0xe503b0c0bad8a0701b28c6adf2ab24f8187b4b2b', '0x30b7cc71cc0bafac4afbc7fccbf6be2b434bb182', '0xd192d44047b11bc1f3e596e3c0c49199dadadee0', '0x2575d2aff5ebc8a9be89d92636b9c11bd10caf37', '0xea7aa0e939c564c5603a5e49c502b277bd64bc71', '0xc9333bac4686a9568bef2b6f1b6cc4fc4e152a9c', '0x39d0a968d90b84b28beccc0c6916d9385233dcd4', '0xffda74091ee0f7da1be60355e36c3c41713a4182', '0xbe1f56a6b0b95ec46a6ef707f46834cdbc003060', '0x0f5d879897a27585d15d958f390f9e55263b4347', '0x135a5e4cd9a5ee2d5154aa96f051803e967dbb8f', '0xbcb18564b7bcb06f23dfbdfcd8fb3d4e3a2c64a7', '0x6b0c7af3bb1844612778a2f29fb17113ed2e8107', '0x0884c5556547a4185008e5718abaa7d60f451b55', '0xb1419aaec52935003c89f7bb9647b7e5f1e27724', '0x19f7b08b26148e45c48fe83f0562845b77aa3b84', '0xfc21c65a083e6e87836098177f12ab57324839ee', '0xeeef4d8eac1874b219db28230a5c3273d6cba2e8', '0xfc743919bdaa47ec845f9f6823087c25a68c97eb', '0x753f05cb011237c818d09e0a33fb78dfe471a99c', '0xd13f7c5080a16f574f404fdd0dd8aa8a860c7d67', '0xf869ea470cb29977d96ac5db8ba2e5d5f5fc0062', '0x788589193225e0e4e7f1a88917a785573b88e57d', '0xaddf16748c91307c2aca6ce485ce329a85264ae8', '0x191790f95b8137acd324cdeb096d45a712fb7847', '0x69e29153cb2400d226fc7c39df344451495bf9a0', '0x0217d2d9b1aab595fbd8d053f4d095bbed0ed622', '0x10557c868e3be52d95730f2dee80db43c17f9ce6', '0x44493dbfdeb8d61c10529d664e29951545be88b9', '0x5348a2313d0ad0a6f1a8b86a4a53447d6f0fd29e', '0xccc32845c6c05e588907c3ecf26a219fd339e2d4', '0x18f92486ae6f0d4c96000db60480f4380fa55384', '0x0a9975e4691a1ea1ff0ed18b734e80d87efda354', '0x4636b890002a9845a00f8632d6e7924a135a143a', '0x1521058ca6716c40bd96f48d35e10ba977104ef6', '0xc1e706995a7936380991473f4571939542fffa56', '0x78073e3f23fdda50a880edf589e22e5f867d8a63', '0x331761d74346daed3f95c50e8f2a67f8155626c4', '0x6ce2817c34a6e56cf30069ab9ac796a4c71e43db', '0xdc739928f97ff87ee1e92aabc3db2cadf892a971', '0x9d70ba690416468c7132c252e35d22899579f0b4', '0xe2682e4b031079612e4a9103c388a85809cae75e', '0x6811f91c2bb9c910e4549dd49eb8c6f9c20de79b', '0xa4016c16b7637fddd2c3d4ddc5cb24ce43b48de6', '0x03fa814ec751a66b71dc313fa62ce13667478a62', '0xbf07c462abb07084287494af3bb2e10f0002e27c', '0x94ec7562a2c3889276485a88d6e0827de044d9d3', '0x083d20c6cf9a05445c3e87bf90d0aca8bdae445f', '0x626a87992784d1bd897df3863e81a507fa902648', '0x8835ea3dd9fcb06aaf2e035b1c716c7f9d9097ab', '0xf7f0151fb1c21740ca82ae701606e7bc69ac3deb', '0x8033d1cd9eb22f64fa9782fb58891bf07d7e70d5', '0x5d2f86e4e2a70117c2b4b9156e892113e8e62c47', '0xe4ff524fb08d3cded614bfb24c76788433783e66', '0x469d6c60582b00fb1fc8d75eb33f6e9f34c32509', '0x1f69497bbeb1dbe319e251f6ccae0b9a548d1712', '0x1dd552fc520ad1d92fb5a819a1711b01d8f32f91', '0xde9454816a024e48f53aa4e141249528a3a12f84', '0x1cb2ca869e0b7afa8c2b8d409a29631ac10165a8', '0x7c10c66ca6cd6e55d42e07bf52ea056774631381', '0x9de5e6a52d2717a532cd1c3d953e114820817cda', '0x57d3891e0a0a9ef72ddba8cbe4525fbaed950162', '0x284e2c1c81cf91636d4fb01696e91cf709201b32', '0xd77e96273fe7db671a35bbb395cde6e5aa310a34', '0x24bc7c943e8f72bf1de370a501c6201d35983d64', '0x018a7420511bef3dfff8b089460331e7b587e87c', '0x87815fb9482708fbb36d476377c88186bede56ce', '0x93a31f1982a0a9e5182d6aae73afb90cd20aaca3', '0x3b92f6a9a9967ed9d506e47415c8e4d52feb2aca', '0x9c4f37ea8e774d0b8d31119d5e85bd030bc892fc', '0x4609aff9704e33e7bcb0de284ee055b6b6d10eb1', '0xb5176c90e4dea85d4a1b826c60a6f0772ec29ad4', '0xaaeb10ada08332c14c09a5a692a0b509cf3b8de2', '0x68481ea4671cbd09891b2c7427d1efece4210c46', '0x61194dd86eb588dec9486deaea86cde842675381', '0xb322f0e529927bc5378fd4f6a644829349fa02f1', '0x9c213caa94c96bbbea33586764326a0487eb0983', '0x41f2a6bb4c4dd7cf42bf1d46975f4f4d450b033e', '0x8eeee58a6a50170e6ff9795ffcf005dcd594f07b', '0xf015a66078c6a7642063e0353f45f5244280adaf', '0x42adcd47f2bac2834d18ffa8b84cbe3be6555ede', '0x43e3ccc6731406d17a217ad7243c678895462087', '0x8b59905a35c98c055c3557d3516a4bcd294e2432', '0xf8883bce11662e258af22a98a12a0c518cbca6e5', '0x0c3ab5de95d3cec78758574cde05c8ee87f410f1', '0x3dd86c0ba237f789bf5773eeaa37d448e6534090', '0x04e3364e795d2c1bcf207e2cc99380d2723bfc1a', '0x35585a3b62483907074a7ab59b379ceb370f1481', '0xd48135a96027903d7f2521a8b57b274dacf83a06', '0x05cdbc4d46522bfae489e43835a3de86f04117d4', '0x26ca6aac2f2ba9514a163e566aa2fa43cef1b00a', '0xd58ea49b8b6c0962ecf42e0d5e720e5d248a6747', '0x280a50bd890beff9c3cc8f1382f07c6cc890055a', '0xe64f13bbd801fc70a6990c0c983b97e1e29ed419', '0xf99d04e60c8a80c26336cb7ba681293240aa2bf1', '0x6c4c33612538861324b1ce805dd395be275ef9a7', '0x83f856417fb22b73cea6f6332144e6587fab6081', '0xddebbcd6bea64532bd3648593d600229a0e471bc', '0x1d15a91f892f5920585f457755424766370e57f9', '0x4346e54d0f1ea055fc8169d95c5c6c2a9cfe6d82', '0x3717d31dc65fa87be9459848de13f66295d1b01d', '0x8d7e85954a11d9bdd368f124dca1a36fe045dff1', '0x41e8bf0480ca876aef61daa66449a1a603e8ad57', '0x000138a5b8eaf84a350689eea346663932a83fd4', '0x94d61e2fbfaba098c5405c53c63d033cbc5af6c5', '0x20358b13af2531c77635c26c295a9ec70d624cc5', '0x4fbd1215c73c3298bbf10e909d6f70e4231af811', '0xa32d9e93caa6317aa28750bdfdc3315ff11dd2b3'];

    beforeEach(async () => {
        HaqqVestingV2 = await ethers.getContractFactory(contractName);
        [owner, addr1] = await ethers.getSigners();
        haqqVesting = await HaqqVestingV2.deploy();
        await haqqVesting.deployed();
    });

    describe("initializer", () => {
        it("should calculate return all deposits", async function () {
            // create two deposits
            await haqqVesting.connect(owner).deposit(addr1.address, {value: ethers.utils.parseEther("1")});
            await haqqVesting.connect(owner).deposit(addr1.address, {value: ethers.utils.parseEther("1")});

            // check indexSize
            expect(await haqqVesting.indexSize()).to.equal(1);

            // create index, should be reverted with reason string 'keyArray is already initialized'
            await expect(haqqVesting.connect(owner).createIndex([addr1.address])).to.be.revertedWith('keyArray is already initialized');

            // call getAllDeposits
            const allDeposits = await haqqVesting.getAllDeposits();

            // [
            //   [
            //     '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            //     BigNumber { value: "1754922168" },
            //     BigNumber { value: "1000000000000000000" },
            //     BigNumber { value: "41666666666666666" },
            //     BigNumber { value: "958333333333333334" },
            //     owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            //     timestamp: BigNumber { value: "1754922168" },
            //     sumInWeiDeposited: BigNumber { value: "1000000000000000000" },
            //     sumPaidAlready: BigNumber { value: "41666666666666666" },
            //     sumLeftToPay: BigNumber { value: "958333333333333334" }
            //   ]

            // check return values
            expect(allDeposits[0].owner).to.equal(addr1.address);
            expect(allDeposits[0].sumInWeiDeposited).to.equal(ethers.utils.parseEther("1"));
            expect(allDeposits[0].sumPaidAlready).to.equal(ethers.utils.parseEther("0.041666666666666666"));
            expect(allDeposits[0].sumLeftToPay).to.equal(ethers.utils.parseEther("0.958333333333333334"));

            expect(allDeposits[1].owner).to.equal(addr1.address);
            expect(allDeposits[1].sumInWeiDeposited).to.equal(ethers.utils.parseEther("1"));
            expect(allDeposits[1].sumPaidAlready).to.equal(ethers.utils.parseEther("0.041666666666666666"));
            expect(allDeposits[1].sumLeftToPay).to.equal(ethers.utils.parseEther("0.958333333333333334"));
        });

        it("should add depositors and calculate return all deposits", async function () {
            // create two deposits
            for (let i = 0; i < depositors.length; i++) {
                await haqqVesting.connect(owner).deposit(depositors[i], {value: ethers.utils.parseEther("1")});
            }

            // check indexSize
            // expect(await haqqVesting.indexSize()).to.equal(depositors.length);

            // create index, should be reverted with reason string 'keyArray is already initialized'
            await haqqVesting.connect(owner).createIndex(depositors);

            // call getAllDeposits
            const allDeposits = await haqqVesting.getAllDeposits();

            // check return values
            for (let i = 0; i < depositors.length; i++) {
                expect(allDeposits[i].owner.toLowerCase()).to.equal(depositors[i]);
                expect(allDeposits[i].sumInWeiDeposited).to.equal(ethers.utils.parseEther("1"));
                expect(allDeposits[i].sumPaidAlready).to.equal(ethers.utils.parseEther("0.041666666666666666"));
                expect(allDeposits[i].sumLeftToPay).to.equal(ethers.utils.parseEther("0.958333333333333334"));
            }
        });
    });
});
