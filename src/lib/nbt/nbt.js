import { parse } from 'prismarine-nbt';
import { Buffer } from 'buffer';
import valid_set_blocks from '$lib/nbt/valid_set_blocks.json';

let map = {};
for (let i = 0; i < valid_set_blocks.length; i++) {
	let block = valid_set_blocks[i];
	if (!map[block.id]) map[block.id] = {};
	map[block.id][block.meta] = block.cid;
}

export default async function parseSchematic(readerResult) {
	const { parsed } = await parse(Buffer.from(readerResult));
	console.log(parsed);
	const value = parsed.value;
	const width = value.Width.value;
	const height = value.Height.value;
	const length = value.Length.value;

	const blocks = value.Blocks.value;
	const meta = value.Data.value;

	const customIds = [];
	for (let i = 0; i < blocks.length; i++) {
		let block = blocks[i];
		let variant = stripUnusedMetadata(block, meta[i]);
		if (block < 0) block += 256;
		let customId = map[block]?.[variant] ?? 0;
		customIds.push(customId);
	}

	return { width, height, length, blocks: customIds };
}

function stripUnusedMetadata(block, meta) {
	switch (block) {
		case 17: // logs
			return meta & 0x0011;
		case 18: // leaves
			return meta & 0x0011;
		case 23: // dispenser
			return 0;
		case 29: // sticky piston
			return meta & 0x0000;
		case 33: // piston
			return meta & 0x0000;
		case 44: // slab
			return meta & 0x0111;
		case 53: // stairs
			return 0;
		case 61: // furnace
			return 0;
		case 67: // cobblestone stairs
			return 0;
		case 86: // pumpkin
			return 0;
		case 91: // jack o lantern
			return 0;
		case 108: // brick stairs
			return 0;
		case 109: // stone brick stairs
			return 0;
		case 114: // nether brick stairs
			return 0;
		case 120: // end portal frame
			return 0;
		case 126: // wood slab
			return meta & 0x0111;
		case 128: // sandstone stairs
			return 0;
		case 134: // spruce wood stairs
			return 0;
		case 135: // birch wood stairs
			return 0;
		case 136: // jungle wood stairs
			return 0;
		case 155: // quartz block
			return meta & 0x0011;
		case 156: // quartz stairs
			return 0;
		case 158: // dropper
			return 0;
		case 161: // leaves2
			return meta & 0x0001;
		case 162: // logs2
			return meta & 0x0001;
		case 163: // acacia wood stairs
			return 0;
		case 164: // dark oak wood stairs
			return 0;
		case 170: // hay bale
			return 0;
		case 180: // red sandstone stairs
			return 0;
		case 182: // red sandstone slab
			return 0;

		default:
			return meta;
	}
}
