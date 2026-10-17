/* Argo the Info Broker - shared launcher and chat window (window.SAOArgo).
 *
 * Stage 3: the window answers questions from the site's own data through shared/sao-argo-engine.js
 * (window.SAOArgoEngine). The engine owns matching and facts; this module owns the wording, so no
 * game fact is ever produced here.
 *
 * Privacy: the conversation itself never leaves memory - it is a plain array of DOM nodes, emptied when
 * the window closes, with no cookies, no network and no database behind it. The one thing that is
 * remembered between visits is which greetings have already been shown (and the last line drawn from
 * each answer pool), so opening the window again does not repeat one. That record is a single small
 * JSON value in the site's own shared storage helper (shared/sao-storage.js), and the chat works
 * normally when storage is missing, full or blocked.
 *
 * Loaded by every page after shared/sao-polish.js and shared/sao-argo-engine.js. It initializes itself
 * once and exposes a small API so other shared modules (the walkthrough) can create the launcher on
 * demand.
 */
(function (global) {
  "use strict";

  const LAUNCHER_ID = "argo-launcher";
  const WINDOW_ID = "argo-window";
  const SPHERE_CLASS = "argo-sphere";
  const SCRIPT_FILE_NAME = "sao-argo.js";
  /* Resolved against this script's own URL, because the pages live at different depths and the
     site has no build step. shared/sao-argo.js -> <site root>/assets/images/MoonlitBlackCats.webp */
  const ASSET_RELATIVE_PATH = "../assets/images/MoonlitBlackCats.webp";

  const CLOSE_TRAVEL_MS = 220;
  /* Upper bound on the closing sequence: if the animation never reports back (unsupported API,
     interrupted, hidden tab) the close still completes. */
  const CLOSE_SAFETY_MS = 700;
  const SPHERE_SIZE = 20;

  const VIEWPORT_MARGIN = 8;
  const WINDOW_GAP = 10;
  const KEYBOARD_STEP = 16;
  const KEYBOARD_STEP_LARGE = 48;
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  /* English defaults for every string this module shows. The entries between the markers are
     generated from the `argo.*` values of the shared English dictionary (shared/sao-i18n.js), which
     is what the pages actually render; this table is the fallback for a page where SAOI18n is
     unavailable, and the reference list of the keys this module can render. Regenerate it with
     `node scripts/generate-argo-fallbacks.js` after editing the English dictionary. */
  const FALLBACK_TEXT = Object.freeze({
    /* BEGIN ARGO ENGLISH FALLBACKS */
    /* argo.chrome */
    "argo.launcherLabel": "Open Argo the Info Broker",
    "argo.title": "Argo the Info Broker",
    "argo.closeLabel": "Close Argo the Info Broker",
    "argo.logLabel": "Conversation with Argo",
    "argo.inputLabel": "Ask Argo about game information",
    "argo.inputPlaceholder": "Ask about mobs, drops, items, recipes, NPCs, quests or locations...",
    "argo.sendLabel": "Send",
    "argo.dragHint": "Drag the title bar to move this window",
    "argo.whoArgo": "Argo",
    "argo.whoYou": "You",
    /* argo.intro */
    "argo.intro.1":
      "Heya! What info are ya after? Ask me about items, mobs, drops, crafting, quests, NPCs or map locations.",
    "argo.intro.2":
      "Argo here. Give me a name - an item, a mob, a quest, a merchant - and I'll dig through the records.",
    "argo.intro.3": "Back again? Good. Name somethin' and I'll tell ya what I know about it.",
    "argo.intro.4": "Information's a trade, and I'm open for business. What are ya lookin' for?",
    "argo.intro.5": "Well now, a customer. Items, mobs, drops, quests - I keep notes on all of it.",
    "argo.intro.6": "Argo's the name and answers are the trade. Ask away.",
    "argo.intro.7": "Got a name for me? A place, a monster, a piece of gear - anything with a record behind it.",
    "argo.intro.8": "Hm? Oh, it's you. Come to buy somethin', or just to chat? Either way, ask.",
    "argo.intro.9": "Everything worth knowin' in Aincrad passes through my hands sooner or later. What do ya need?",
    "argo.intro.10": "You've got questions and I've got notes. Let's see if they match up.",
    /* argo.lead.item */
    "argo.lead.item.1": "Oho, found a lead!",
    "argo.lead.item.2": "Let's see what the records say about that one.",
    "argo.lead.item.3": "Got the file right here.",
    "argo.lead.item.4": "That one rings a bell. Give me a moment.",
    "argo.lead.item.5": "Gear questions are my bread and butter.",
    "argo.lead.item.6": "Hm, let me check my notes on that.",
    "argo.lead.item.7": "You're in luck - I've got a page on it.",
    "argo.lead.item.8": "An item, is it? I like it when folks ask about things I can actually name.",
    "argo.lead.item.9": "Let's dig. Items leave a paper trail, and I keep the paper.",
    "argo.lead.item.10": "I've sold worse information for good Col. This one's free.",
    "argo.lead.item.11": "Right, that name's familiar.",
    "argo.lead.item.12": "Let's see what I've got written down.",
    "argo.lead.item.13": "Oho, askin' about the good stuff.",
    "argo.lead.item.14": "I've been waitin' for someone to ask about that one.",
    "argo.lead.item.15": "Sure, I know that one.",
    "argo.lead.item.16": "Hm, that name's in my book somewhere.",
    "argo.lead.item.17": "Let me flip to the right page.",
    "argo.lead.item.18": "You want the details? I've got the details.",
    "argo.lead.item.19": "Now that's a name worth lookin' up.",
    "argo.lead.item.20": "Let's see how much I can tell ya.",
    /* argo.lead.recipe */
    "argo.lead.recipe.1": "Ah, a crafter's question. I like it.",
    "argo.lead.recipe.2": "Let me dig up that recipe.",
    "argo.lead.recipe.3": "Here's what the records list for that one.",
    "argo.lead.recipe.4": "Makin' somethin', are ya? Let me check.",
    "argo.lead.recipe.5": "Hm, recipes I keep tidy.",
    "argo.lead.recipe.6": "Let's see what goes into that.",
    "argo.lead.recipe.7": "Right, let's find the materials.",
    "argo.lead.recipe.8": "A crafter with Col to spend. Good.",
    "argo.lead.recipe.9": "Let me see what the records say it takes.",
    "argo.lead.recipe.10": "That one's got a recipe, I'm fairly sure.",
    "argo.lead.recipe.11": "Let me pull up the list.",
    "argo.lead.recipe.12": "Hm, let me check what's needed for that.",
    /* argo.lead.mob */
    "argo.lead.mob.1": "Oho, a huntin' question.",
    "argo.lead.mob.2": "Let's see what the Bestiary says.",
    "argo.lead.mob.3": "I've got a page on that one.",
    "argo.lead.mob.4": "A monster, hm? Those leave plenty of tracks.",
    "argo.lead.mob.5": "You're huntin', are ya? Let me check.",
    "argo.lead.mob.6": "That one's got a nasty reputation, if I recall right.",
    "argo.lead.mob.7": "Let's see what the records say about that beast.",
    "argo.lead.mob.8": "Plenty of folks ask about that one. Let me pull my notes.",
    "argo.lead.mob.9": "Hm, I know that name.",
    "argo.lead.mob.10": "Let me look up what I've got on it.",
    "argo.lead.mob.11": "A hunter's question. My favourite kind.",
    "argo.lead.mob.12": "Right, that one. Give me a second.",
    "argo.lead.mob.13": "Let's see where it lives and what it hits with.",
    "argo.lead.mob.14": "I keep notes on everything with teeth. Let me check.",
    "argo.lead.mob.15": "That's a name I've heard more than once.",
    "argo.lead.mob.16": "Let me see what I've got written down on that one.",
    "argo.lead.mob.17": "Careful with that one - or don't, it's your neck. Here's what I know.",
    "argo.lead.mob.18": "Hm, let me dig through the Bestiary pages.",
    "argo.lead.mob.19": "Monsters are easy business. They're always somewhere.",
    "argo.lead.mob.20": "Let's see if it's as nasty as they say.",
    /* argo.lead.mobDrops */
    "argo.lead.mobDrops.1": "Ah, a looter's question!",
    "argo.lead.mobDrops.2": "Let's check what it drops.",
    "argo.lead.mobDrops.3": "Here's the loot list I've got.",
    "argo.lead.mobDrops.4": "After its pockets, are ya? Sensible.",
    "argo.lead.mobDrops.5": "Let's see what falls out of that one.",
    "argo.lead.mobDrops.6": "Hm, drop lists I do keep.",
    "argo.lead.mobDrops.7": "You want what it's carryin'. Fair enough.",
    "argo.lead.mobDrops.8": "Let me check the list. I don't guess these.",
    "argo.lead.mobDrops.9": "That one's worth huntin' for a reason.",
    "argo.lead.mobDrops.10": "Right, let's see what it leaves behind.",
    "argo.lead.mobDrops.11": "Kill it, take its things. That's the business.",
    "argo.lead.mobDrops.12": "Let me see what I've got recorded for it.",
    "argo.lead.mobDrops.13": "Hm, let me check what's on the list.",
    "argo.lead.mobDrops.14": "Let's see if it's worth your time.",
    /* argo.lead.drop */
    "argo.lead.drop.1": "Oho, followin' a drop trail?",
    "argo.lead.drop.2": "Let's see who's holding that.",
    "argo.lead.drop.3": "I dug through the drop lists for that.",
    "argo.lead.drop.4": "Lookin' for where it comes from? Smart.",
    "argo.lead.drop.5": "Let me check who's carryin' that.",
    "argo.lead.drop.6": "Hm, that one's a drop, is it?",
    "argo.lead.drop.7": "Somebody's got it. Let's find out who.",
    "argo.lead.drop.8": "I keep the drop lists sorted. Give me a moment.",
    "argo.lead.drop.9": "Right, let's trace it back.",
    "argo.lead.drop.10": "Let me see which mobs are holdin' that.",
    "argo.lead.drop.11": "Chasin' a drop, are ya? I'd do the same.",
    "argo.lead.drop.12": "Hm, let me see what's recorded.",
    "argo.lead.drop.13": "That one doesn't grow on trees. Let me look.",
    "argo.lead.drop.14": "Let's see who's generous enough to hand it over.",
    /* argo.lead.npc */
    "argo.lead.npc.1": "Ask around, and you find people. Let me check.",
    "argo.lead.npc.2": "Let's see where you can find them.",
    "argo.lead.npc.3": "I've got a line on that one.",
    "argo.lead.npc.4": "Lookin' for someone? Let me check my notes.",
    "argo.lead.npc.5": "Hm, people move around. Let me look.",
    "argo.lead.npc.6": "Right, let's see where they set up shop.",
    "argo.lead.npc.7": "I know most of the shopkeepers. Let me look.",
    "argo.lead.npc.8": "Let me see what I've got on them.",
    "argo.lead.npc.9": "Hm, let me check where they're standin'.",
    "argo.lead.npc.10": "Merchants and wanderers - I keep track of both.",
    "argo.lead.npc.11": "Let me see if I can point ya their way.",
    "argo.lead.npc.12": "Right, let's find them.",
    /* argo.lead.quest */
    "argo.lead.quest.1": "Ah, a quest lead.",
    "argo.lead.quest.2": "Let's look at the quest sheet.",
    "argo.lead.quest.3": "Here's what I've got on that quest.",
    "argo.lead.quest.4": "Work, is it? Let me check the board.",
    "argo.lead.quest.5": "Hm, that one's been askin' around for help.",
    "argo.lead.quest.6": "Let me see what I've got written down.",
    "argo.lead.quest.7": "A quest, hm? Those I keep careful notes on.",
    "argo.lead.quest.8": "Right, let's see who's handin' it out.",
    "argo.lead.quest.9": "Somebody wants somethin' done. Let me check.",
    "argo.lead.quest.10": "I've got notes on most of these.",
    "argo.lead.quest.11": "Let's see the details before ya take the job.",
    "argo.lead.quest.12": "Hm, let me pull that sheet.",
    "argo.lead.quest.13": "Work pays. Let's see what it's worth.",
    "argo.lead.quest.14": "Let's see the reward before ya commit to it.",
    /* argo.lead.location */
    "argo.lead.location.1": "Oho, want the lay of the land?",
    "argo.lead.location.2": "Let's see where that is.",
    "argo.lead.location.3": "I've got that pinned on the map.",
    "argo.lead.location.4": "Directions, is it? I can do directions.",
    "argo.lead.location.5": "Let me check the map notes.",
    "argo.lead.location.6": "Hm, that's a place, is it? Let me look.",
    "argo.lead.location.7": "You'll be wantin' coordinates, I expect.",
    "argo.lead.location.8": "Right, let's find it on the map.",
    "argo.lead.location.9": "I know these floors better than most.",
    "argo.lead.location.10": "Let me see what's marked down there.",
    "argo.lead.location.11": "Places I can usually pin down. Let's try.",
    "argo.lead.location.12": "Hm, let me check my map notes.",
    "argo.lead.location.13": "Easy enough - if my notes are right.",
    "argo.lead.location.14": "Let's see what's around there.",
    /* argo.lead.collection */
    "argo.lead.collection.1": "{label}? I've got {count} on record - here's the whole lot.",
    "argo.lead.collection.2": "A full sweep of {label}, is it? {count} names, and not one of them a guess.",
    "argo.lead.collection.3": "The {label} shelf, is it? {count} of them, every one checked.",
    "argo.lead.collection.4": "You're after the {label} list. {count} of them - let's read them out.",
    "argo.lead.collection.5": "Ah, browsing the whole shelf. {count} {label}, coming right up.",
    "argo.lead.collection.6": "Right, let me pull the {label} file. {count} of them - have a look.",
    /* argo.lead.ranking */
    "argo.lead.ranking.1": "Let's see who comes out on top.",
    "argo.lead.ranking.2": "A ranking, is it? Now that's my kind of question.",
    "argo.lead.ranking.3": "Numbers don't argue. Let's line them up.",
    "argo.lead.ranking.4": "Let me sort these the way the records do.",
    "argo.lead.ranking.5": "You want the top of the list. Let's have a look.",
    "argo.lead.ranking.6": "Oho, weighing the field. I do like a good ladder.",
    /* argo.lead.comparison */
    "argo.lead.comparison.1": "Side by side, then. Let's see how they measure up.",
    "argo.lead.comparison.2": "Putting those two next to each other - here's the picture.",
    "argo.lead.comparison.3": "A comparison? Fair enough, let's line them up.",
    "argo.lead.comparison.4": "Let's lay them out and see who blinks first.",
    "argo.lead.comparison.5": "Two records, one table. Have a look.",
    "argo.lead.comparison.6": "You want them weighed against each other. Here's what the records hold.",
    /* argo.lead.farming */
    "argo.lead.farming.1": "Hunting for it, are you? Let's find your best odds.",
    "argo.lead.farming.2": "A farming question. That's the practical kind - I approve.",
    "argo.lead.farming.3": "So you want it in bulk. Here's where it comes from.",
    "argo.lead.farming.4": "Let's see who's been dropping that, and how often.",
    "argo.lead.farming.5": "Ah, a supply question. My favourite sort of business.",
    "argo.lead.farming.6": "You'll want the sources, then. Let me dig them out.",
    /* argo.facts.item */
    "argo.facts.item.1": "Here's what's written down:",
    "argo.facts.item.2": "This is what I've got on it:",
    "argo.facts.item.3": "The records say this:",
    /* argo.facts.recipe */
    "argo.facts.recipe.1": "Here's the list:",
    "argo.facts.recipe.2": "What it takes:",
    "argo.facts.recipe.3": "This is what's recorded:",
    /* argo.facts.mob */
    "argo.facts.mob.1": "Here's what I've got:",
    "argo.facts.mob.2": "The page says this:",
    "argo.facts.mob.3": "The entry reads like this:",
    /* argo.facts.mobDrops */
    "argo.facts.mobDrops.1": "Here's the drop list:",
    "argo.facts.mobDrops.2": "This is what's noted for it:",
    "argo.facts.mobDrops.3": "What I've got says this:",
    /* argo.facts.drop */
    "argo.facts.drop.1": "Here's who's holding it:",
    "argo.facts.drop.2": "The lists say this:",
    "argo.facts.drop.3": "This is what I found:",
    /* argo.facts.npc */
    "argo.facts.npc.1": "Here's what I know:",
    "argo.facts.npc.2": "This is what's noted:",
    "argo.facts.npc.3": "The notes say this:",
    /* argo.facts.quest */
    "argo.facts.quest.1": "Here's the sheet:",
    "argo.facts.quest.2": "This is what's on it:",
    "argo.facts.quest.3": "The sheet says this:",
    /* argo.facts.location */
    "argo.facts.location.1": "Here's what's marked:",
    "argo.facts.location.2": "This is what I have:",
    "argo.facts.location.3": "The map notes say this:",
    /* argo.close */
    "argo.close.1": "That's straight from the records.",
    "argo.close.2": "That's all solid - I checked.",
    "argo.close.3": "No guessin' in any of that.",
    "argo.close.4": "You can take that to the bank.",
    "argo.close.5": "Every line of that is written down somewhere.",
    "argo.close.6": "That's the whole of what's recorded.",
    "argo.close.7": "Reliable, that. I don't pass on rumors.",
    "argo.close.8": "That's from the source, not from gossip.",
    "argo.close.9": "Good information, that. Worth the price.",
    "argo.close.10": "That's what the records say, and they don't lie to me.",
    "argo.close.11": "Clean information. Enjoy it.",
    "argo.close.12": "That's confirmed, not hearsay.",
    /* argo.close.collection */
    "argo.close.collection.1": "That's the set, complete as the records have it.",
    "argo.close.collection.2": "Every one of those is on the books - nothing padded.",
    "argo.close.collection.3": "If it's not in that list, the records don't know it either.",
    "argo.close.collection.4": "That's the lot. Happy hunting.",
    /* argo.close.ranking */
    "argo.close.ranking.1": "That's how the records stack them up.",
    "argo.close.ranking.2": "The order is the records' own, not my opinion.",
    "argo.close.ranking.3": "That's the ladder as the records put it.",
    "argo.close.ranking.4": "Those are the standings, straight off the page.",
    /* argo.close.comparison */
    "argo.close.comparison.1": "Both entries are the records' own - draw your own conclusion.",
    "argo.close.comparison.2": "That's the pair of them, field by field.",
    "argo.close.comparison.3": "Nothing hidden in that table.",
    "argo.close.comparison.4": "Judge for yourself - the numbers are all there.",
    /* argo.close.farming */
    "argo.close.farming.1": "Those are the recorded sources, best odds first.",
    "argo.close.farming.2": "The rates are the records' own; the rest is your luck.",
    "argo.close.farming.3": "That's where it drops, as far as my notes go.",
    "argo.close.farming.4": "Good luck out there - that's everything the notes hold.",
    /* argo.label */
    "argo.label.floor": "Floor {floor}",
    "argo.label.level": "Lv {level}",
    "argo.label.stats": "Stats",
    "argo.label.craftingLocation": "Crafting location",
    "argo.label.craftingResources": "Crafting resources",
    "argo.label.droppedBy": "Dropped by",
    "argo.label.drops": "Drops",
    "argo.label.spawnArea": "Spawn area",
    "argo.label.mobs": "Mobs",
    "argo.label.rewards": "Rewards",
    "argo.label.requirements": "Requirements",
    "argo.label.npc": "NPC",
    "argo.label.sells": "Sells",
    "argo.label.quests": "Quests",
    "argo.label.unknown": "unknown",
    "argo.label.recordsFound": "{label}: {count}",
    "argo.label.moreRecords": "and {count} more (of {total})",
    "argo.label.rankedBy": "{label} by {field}, {direction}:",
    "argo.label.highestFirst": "highest first",
    "argo.label.lowestFirst": "lowest first",
    "argo.label.bestSource": "Best recorded source: {mob} ({chance}%)",
    "argo.label.levelField": "Level",
    "argo.label.typeField": "Type",
    "argo.label.categoryField": "Category",
    "argo.label.questType": "Quest type",
    "argo.label.bestiaryTab": "Bestiary list",
    /* argo.label.target */
    "argo.label.target.quest": "Quests",
    "argo.label.target.boss": "Bosses",
    "argo.label.target.mob": "Mobs",
    "argo.label.target.item": "Items",
    "argo.label.target.npc": "NPCs",
    "argo.label.target.location": "Locations",
    "argo.label.target.dungeon": "Dungeons",
    "argo.label.target.area": "Areas",
    /* argo.note.itemRecordMissing */
    "argo.note.itemRecordMissing.1":
      "There's more to this one than I've got in my notes. That's all I can give ya for now.",
    "argo.note.itemRecordMissing.2": "That's everythin' I've got on it - my notes on this one are thin.",
    "argo.note.itemRecordMissing.3":
      "I've given ya what I have. The rest of it isn't written down anywhere I can reach.",
    /* argo.note.bestiaryRecordMissing */
    "argo.note.bestiaryRecordMissing.1": "I've no page on that one in my notes - only what I've got here.",
    "argo.note.bestiaryRecordMissing.2": "My notes on it start and end with what ya see.",
    "argo.note.bestiaryRecordMissing.3": "That one's barely written up. What's above is the whole of it.",
    /* argo.note.noDropRecord */
    "argo.note.noDropRecord.1": "Nobody's written down what it drops, so I won't guess.",
    "argo.note.noDropRecord.2": "No drop list on that one - and I don't invent those.",
    "argo.note.noDropRecord.3": "I've got no drop list for it. I'd rather say nothin' than make somethin' up.",
    /* argo.note.noRecipe */
    "argo.note.noRecipe.1": "No recipe's written down for it, so I can't hand ya one.",
    "argo.note.noRecipe.2": "I've got no recipe for that one.",
    "argo.note.noRecipe.3": "Nobody's recorded how that's made, and I don't invent recipes.",
    /* argo.note.noCraftingLocation */
    "argo.note.noCraftingLocation.1": "My notes don't say where it's made or sold.",
    "argo.note.noCraftingLocation.2": "No workshop or merchant is written next to that one.",
    "argo.note.noCraftingLocation.3": "I can't tell ya where to make it - that part's blank in my notes.",
    /* argo.note.noStats */
    "argo.note.noStats.1": "There are no numbers written down for it.",
    "argo.note.noStats.2": "Nobody's recorded its stats.",
    "argo.note.noStats.3": "I've got no figures for that one.",
    /* argo.note.noSpawnArea */
    "argo.note.noSpawnArea.1": "No spawn area is written down for it.",
    "argo.note.noSpawnArea.2": "My notes don't say where it turns up.",
    "argo.note.noSpawnArea.3": "Where it lives isn't recorded.",
    /* argo.note.markerNotFound */
    "argo.note.markerNotFound.1": "I couldn't pin that one on the map.",
    "argo.note.markerNotFound.2": "That name isn't marked anywhere I can see.",
    "argo.note.markerNotFound.3": "No map mark for that one, so I can't point ya there.",
    /* argo.note.questMarkerOnly */
    "argo.note.questMarkerOnly.1": "All I've got is its mark on the map, not the quest details.",
    "argo.note.questMarkerOnly.2": "Only its location is written down, not the rest of the job.",
    "argo.note.questMarkerOnly.3": "The map knows it. My notes on the quest itself are empty.",
    /* argo.note.absenceNotProof */
    "argo.note.absenceNotProof.1": "That's no proof it isn't in the game - just that my notes don't have it.",
    "argo.note.absenceNotProof.2":
      "Don't take that as proof it doesn't exist. It only means I haven't got it written down.",
    "argo.note.absenceNotProof.3": "Me not knowin' it isn't the same as it not bein' there.",
    /* argo.note.otherIsland */
    "argo.note.otherIsland.1": "That one's on a different island than the one you're lookin' at.",
    "argo.note.otherIsland.2": "That belongs to another island - you're viewin' a different one.",
    "argo.note.otherIsland.3": "Different island entirely, that one.",
    /* argo.note.englishOnly */
    "argo.note.englishOnly.1":
      "Fair warning: I read the wording in English, with a few words of Spanish and French - keep names in English and we'll get on fine.",
    "argo.note.englishOnly.2":
      "I read the question itself in English, and I catch a handful of Spanish or French words, but names should be in English.",
    "argo.note.englishOnly.3":
      "Questions I read in English, and I pick up a little Spanish and French - though names are safest in English.",
    /* argo.note.floorInferred */
    "argo.note.floorInferred.1": "That record lives on Floor {floor}.",
    "argo.note.floorInferred.2": "I've got that written down under Floor {floor}.",
    "argo.note.floorInferred.3": "You'll find that on Floor {floor} in my notes.",
    /* argo.note.otherFloorRecords */
    "argo.note.otherFloorRecords.1": "{count} more are recorded on {floors}.",
    "argo.note.otherFloorRecords.2": "There are {count} more on {floors}, if you ever head that way.",
    "argo.note.otherFloorRecords.3": "My notes hold {count} more on {floors}.",
    /* argo.note.rankingUnknown */
    "argo.note.rankingUnknown.1": "{count} of them have no recorded value, so I'm not ranking those.",
    "argo.note.rankingUnknown.2": "Another {count} have no figure written down, so I left them out rather than guess.",
    "argo.note.rankingUnknown.3": "{count} more have nothing recorded for it, so they are not in the list.",
    /* argo.note.chanceNotRecorded */
    "argo.note.chanceNotRecorded.1": "Some of those rates aren't written down anywhere.",
    "argo.note.chanceNotRecorded.2": "Not every source has a recorded rate - I only pass on what's written.",
    "argo.note.chanceNotRecorded.3": "Where the rate isn't recorded, I've left it out rather than guess.",
    /* argo.note.noRecordedRate */
    "argo.note.noRecordedRate.1": "Nobody's written down a drop rate for any of those sources.",
    "argo.note.noRecordedRate.2": "I've got the sources, but not a single rate, so I can't call any of them the best.",
    "argo.note.noRecordedRate.3": "The sources are recorded; the rates are not.",
    /* argo.note.comparisonTruncated */
    "argo.note.comparisonTruncated.1": "That's not every field - there are {count} of them in total.",
    "argo.note.comparisonTruncated.2": "There are {count} fields altogether; I've shown the first few.",
    "argo.note.comparisonTruncated.3": "The full list runs to {count} fields.",
    /* argo.status.ambiguous */
    "argo.status.ambiguous.1": "Hm, that could be a few things. Which one did ya mean?",
    "argo.status.ambiguous.2": "Hold on - I've got more than one match for that:",
    "argo.status.ambiguous.3": "That name's doin' double duty. Which one?",
    "argo.status.ambiguous.4": "Hm, ya gave me a name that fits more than one thing:",
    "argo.status.ambiguous.5": "Careful now - that could be any of these:",
    "argo.status.ambiguous.6": "I've got a few entries under that name. Take your pick:",
    "argo.status.ambiguous.7": "That's not specific enough for my notes. Which of these?",
    "argo.status.ambiguous.8": "More than one thing answers to that name. Which?",
    /* argo.status.missing */
    "argo.status.missing.1": "Hm, I found the name but not the details.",
    "argo.status.missing.2": "I've only got part of that one.",
    "argo.status.missing.3": "I know the name, but my notes run dry after that.",
    "argo.status.missing.4": "That one's only half-written in my book.",
    "argo.status.missing.5": "I've got the name and not much else.",
    "argo.status.missing.6": "Hm, that one's thin. Here's what I do have.",
    "argo.status.missing.7": "I've got a piece of that, not the whole.",
    "argo.status.missing.8": "My notes on that one are incomplete. Here's what's there.",
    /* argo.status.unsupported */
    "argo.status.unsupported.1": "Hm, haven't got a reliable lead on that one yet.",
    "argo.status.unsupported.2": "That's outside my records, sorry.",
    "argo.status.unsupported.3": "That's not the kind of thing I keep notes on.",
    "argo.status.unsupported.4": "Can't help ya with that one - it's not in my line.",
    "argo.status.unsupported.5": "Hm, that's beyond what I deal in.",
    "argo.status.unsupported.6": "I've got nothin' for that, and I won't invent it.",
    "argo.status.unsupported.7": "That one's outside my trade, I'm afraid.",
    "argo.status.unsupported.8": "No records on that one. Try me with somethin' from the game.",
    /* argo.status.candidates */
    "argo.status.candidates.1": "Candidates:",
    "argo.status.candidates.2": "Here's what turned up:",
    "argo.status.candidates.3": "Possible matches:",
    /* argo.status.emptySet */
    "argo.status.emptySet.1": "Nothing on this floor matches that.",
    "argo.status.emptySet.2": "That list came up empty, I'm afraid.",
    "argo.status.emptySet.3": "I've been through the whole list - there's nothing matching that here.",
    /* argo.status */
    "argo.status.sourcesAvailable": "On this page I can only see: {sources}.",
    "argo.status.noSources": "I can't see any game records on this page yet.",
    /* argo.status.engineMissing */
    "argo.status.engineMissing.1": "My records aren't loaded on this page yet, so I can't look anything up here.",
    "argo.status.engineMissing.2": "I've got no notes with me on this page. Try me where my records are loaded.",
    "argo.status.engineMissing.3": "My book isn't on this page, so there's nothin' for me to check.",
    "argo.status.engineMissing.4": "Nothin' to work with here - my records aren't loaded on this page yet.",
    /* argo.status.datasetUnsupported */
    "argo.status.datasetUnsupported.1":
      "Heh, I only deal in Current Data these days. Switch your dataset to Current Data, and I'll see what I can find for ya.",
    "argo.status.datasetUnsupported.2":
      "My notes only cover Current Data now. Flip your dataset over to Current Data and ask me again.",
    "argo.status.datasetUnsupported.3":
      "Current Data only - that's my rule. Change your dataset and I'll dig through what I've got.",
    "argo.status.datasetUnsupported.4":
      "Ya won't get Beta-Test answers out of me; I work from Current Data. Switch your dataset and I'll take another look.",
    /* argo.status.error */
    "argo.status.error.1": "Something jammed in my files just now. Try asking me again?",
    "argo.status.error.2": "Hm, my notes just scattered on me. Ask me again?",
    "argo.status.error.3": "That one got lost on the way to my desk. Try me again?",
    "argo.status.error.4": "Something's tangled up in my notes. Give it another go?",
    /* argo.type */
    "argo.type.item": "Item",
    "argo.type.mob": "Mob",
    "argo.type.boss": "Boss",
    "argo.type.npc": "NPC",
    "argo.type.merchant": "Merchant",
    "argo.type.location": "Location",
    "argo.type.dungeon": "Dungeon",
    "argo.type.quest": "Quest",
    /* argo.help.body */
    "argo.help.body.1":
      "Ask me about items and gear, mobs and bosses, what drops what, crafting recipes, quests, NPCs and merchants, or map locations. Give me a name and I'll dig through the records.",
    "argo.help.body.2":
      "I deal in names: items, gear, monsters, bosses, drops, recipes, quests, shopkeepers, places. Give me one and I'll tell ya what I know.",
    "argo.help.body.3":
      "Bring me a name - a mob, an item, a quest, a merchant, a spot on the map - and I'll check my notes on it.",
    "argo.help.body.4":
      "Mobs, drops, items, recipes, quests, NPCs, locations. Name any of those and I'll look it up for ya."
    /* END ARGO ENGLISH FALLBACKS */
  });

  const state = {
    document: null,
    launcher: null,
    windowEl: null,
    titlebar: null,
    log: null,
    form: null,
    input: null,
    closeButton: null,
    messages: [],
    open: false,
    closing: false,
    left: null,
    top: null,
    drag: null,
    sphere: null,
    closeTimer: null,
    cleanups: [],
    initialized: false,
    /* The conversation's own identity, used to guard an answer that arrives after the window closed.
       Nothing about the wording is keyed to it: every line is drawn at random from its own pool. */
    conversationId: 0,
    /* The greeting shown last, so the next open cannot repeat it even with no storage to remember in. */
    introKey: null,
    /* One shuffled bag per dialogue pool and per answer structure: the lines that have not been drawn
       yet. A bag survives closing and reopening the window, so reopening cannot restart a sequence. */
    poolBags: {},
    /* The remembered record, read once from storage and written back when it changes. */
    dialogueMemory: null,
    dialogueDirty: false,
    /* Replaceable so the tests can drive selection deterministically. */
    randomSource: null
  };
  function getDocument() {
    return state.document || global.document || null;
  }

  function prefersReducedMotion() {
    try {
      return Boolean(global.matchMedia && global.matchMedia(REDUCED_MOTION_QUERY).matches);
    } catch (_error) {
      return false;
    }
  }

  /* SAOI18n.t() returns the key itself when a key is missing, so a missing key falls back to the
     English literal instead of rendering "argo.title" to the visitor. */
  function translate(key, fallback, params) {
    const i18n = global.SAOI18n;
    if (!i18n || typeof i18n.t !== "function") return applyParams(fallback, params);
    let value = null;
    try {
      value = i18n.t(key, params);
    } catch (_error) {
      return applyParams(fallback, params);
    }
    if (typeof value === "string" && value && value !== key) return applyParams(value, params);
    return applyParams(fallback, params);
  }

  /* Fills {token} placeholders. SAOI18n already does this for dictionary values; this covers the
     English fallback path (and a dictionary value that is missing a token). */
  function applyParams(text, params) {
    if (!params || typeof params !== "object") return text;
    return String(text).replace(/\{(\w+)\}/g, (match, token) =>
      Object.prototype.hasOwnProperty.call(params, token) ? String(params[token]) : match
    );
  }

  /* Looks a key up in the shared dictionaries, falling back to this module's English table. */
  function t(key, params) {
    const fallback = Object.prototype.hasOwnProperty.call(FALLBACK_TEXT, key) ? FALLBACK_TEXT[key] : key;
    return translate(key, fallback, params);
  }

  function createElement(tagName, className) {
    const doc = getDocument();
    if (!doc || typeof doc.createElement !== "function") return null;
    const element = doc.createElement(tagName);
    if (className) element.className = className;
    return element;
  }

  /* A plain text node, used to keep the words around an inline link exactly as written. */
  function createTextNode(text) {
    const doc = getDocument();
    if (!doc || typeof doc.createTextNode !== "function") return null;
    return doc.createTextNode(String(text));
  }

  /* Registers a listener and keeps its cleanup so destroy() can remove every one of them. */
  function listen(target, type, handler, options) {
    if (!target || typeof target.addEventListener !== "function") return;
    target.addEventListener(type, handler, options);
    state.cleanups.push(() => target.removeEventListener?.(type, handler, options));
  }

  function setLabel(element, attribute, key) {
    if (!element) return;
    element.setAttribute(attribute, t(key));
    element.setAttribute(`data-i18n-${attribute}`, key);
  }

  function setText(element, key) {
    if (!element) return;
    element.textContent = t(key);
    element.setAttribute("data-i18n", key);
  }

  /* Resolved from this script's own src, with a selector fallback for the rare case where
     document.currentScript is unavailable. */
  function resolveAssetUrl() {
    const doc = getDocument();
    if (!doc) return null;
    let source = "";
    const current = doc.currentScript;
    if (current && current.src) source = current.src;
    if (!source && typeof doc.querySelector === "function") {
      const tag = doc.querySelector(`script[src$="${SCRIPT_FILE_NAME}"]`);
      if (tag && tag.src) source = tag.src;
    }
    if (!source) return null;
    try {
      return new URL(ASSET_RELATIVE_PATH, source).href;
    } catch (_error) {
      return null;
    }
  }

  /* The circular crop is pure CSS; the original asset is never modified. */
  function createAvatar(className, size) {
    const url = resolveAssetUrl();
    if (!url) return null;
    const image = createElement("img", className);
    if (!image) return null;
    image.src = url;
    image.alt = "";
    image.width = size;
    image.height = size;
    image.setAttribute("aria-hidden", "true");
    image.setAttribute("decoding", "async");
    return image;
  }

  function clamp(value, minimum, maximum) {
    if (maximum < minimum) return minimum;
    return Math.min(Math.max(value, minimum), maximum);
  }

  function getViewport() {
    const width = Number(global.innerWidth) || 0;
    const height = Number(global.innerHeight) || 0;
    return {
      width: width > 0 ? width : 1024,
      height: height > 0 ? height : 768
    };
  }

  function measure(element) {
    if (!element || typeof element.getBoundingClientRect !== "function") return null;
    const rect = element.getBoundingClientRect();
    if (!rect) return null;
    return {
      left: Number(rect.left) || 0,
      top: Number(rect.top) || 0,
      width: Number(rect.width) || 0,
      height: Number(rect.height) || 0
    };
  }
  /* --- Launcher -------------------------------------------------------------- */

  function buildLauncher() {
    const doc = getDocument();
    if (!doc || !doc.body) return null;
    const button = createElement("button", "");
    if (!button) return null;
    button.id = LAUNCHER_ID;
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", WINDOW_ID);
    setLabel(button, "aria-label", "argo.launcherLabel");
    setLabel(button, "title", "argo.launcherLabel");
    const avatar = createAvatar("argo-launcher-image", 40);
    if (avatar) button.appendChild(avatar);
    listen(button, "click", (event) => {
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      toggle();
    });
    doc.body.appendChild(button);
    return button;
  }

  /* --- Window --------------------------------------------------------------- */

  function buildWindow() {
    const doc = getDocument();
    if (!doc || !doc.body) return null;
    const container = createElement("section", "");
    if (!container) return null;
    container.id = WINDOW_ID;
    container.hidden = true;
    container.setAttribute("role", "dialog");
    container.setAttribute("aria-modal", "false");
    container.setAttribute("aria-labelledby", `${WINDOW_ID}-title`);

    const titlebar = createElement("div", "argo-titlebar");
    titlebar.tabIndex = 0;
    setLabel(titlebar, "aria-label", "argo.dragHint");
    setLabel(titlebar, "title", "argo.dragHint");

    const avatar = createAvatar("argo-titlebar-image", 30);
    if (avatar) titlebar.appendChild(avatar);

    const title = createElement("h2", "argo-title");
    title.id = `${WINDOW_ID}-title`;
    setText(title, "argo.title");
    titlebar.appendChild(title);

    const closeButton = createElement("button", "argo-close");
    closeButton.type = "button";
    /* The cross is drawn by the stylesheet (two bars centred on the button) instead of a text glyph:
       a glyph is centred on its line box rather than on its ink, so it sits visibly off-centre inside
       the circle and moves whenever the visitor's system substitutes a different font. The button's
       accessible name comes from the label below, so it is unaffected. */
    setLabel(closeButton, "aria-label", "argo.closeLabel");
    setLabel(closeButton, "title", "argo.closeLabel");
    titlebar.appendChild(closeButton);

    const log = createElement("div", "argo-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-relevant", "additions");
    log.tabIndex = 0;
    setLabel(log, "aria-label", "argo.logLabel");

    const form = createElement("form", "argo-form");
    const input = createElement("input", "argo-input");
    input.type = "text";
    input.autocomplete = "off";
    setLabel(input, "placeholder", "argo.inputPlaceholder");
    setLabel(input, "aria-label", "argo.inputLabel");
    const send = createElement("button", "argo-send");
    send.type = "submit";
    setText(send, "argo.sendLabel");
    form.appendChild(input);
    form.appendChild(send);

    container.appendChild(titlebar);
    container.appendChild(log);
    container.appendChild(form);
    doc.body.appendChild(container);

    listen(closeButton, "click", (event) => {
      if (event && typeof event.preventDefault === "function") event.preventDefault();
      close();
    });
    listen(form, "submit", handleSubmit);
    listen(titlebar, "pointerdown", onTitlebarPointerDown);
    listen(titlebar, "pointermove", onTitlebarPointerMove);
    listen(titlebar, "pointerup", onTitlebarPointerEnd);
    listen(titlebar, "pointercancel", onTitlebarPointerEnd);
    listen(titlebar, "keydown", onTitlebarKeydown);

    return { container, titlebar, log, form, input, closeButton };
  }
  /* --- Conversation (in memory only) --------------------------------------- */

  /* A link to one of the site's own pages. The href has already been resolved against this page's own
     origin and scheme by SAOPageUtils, and the label is set as text rather than markup, so neither
     record data nor the visitor's question can put an attribute or an element into the window. */
  function createLink(link) {
    const doc = getDocument();
    const href = textOf(link && link.href).trim();
    if (!doc || typeof doc.createElement !== "function" || !href) return null;
    const anchor = doc.createElement("a");
    if (!anchor) return null;
    if (anchor.classList && typeof anchor.classList.add === "function") anchor.classList.add("argo-link");
    if (typeof anchor.setAttribute === "function") anchor.setAttribute("href", href);
    anchor.textContent = textOf(link && link.label);
    return anchor;
  }

  /* The answer's text, with the first mention of each linked entity rendered as its own anchor. The text
     itself is never altered - an anchor carries the same name as the plain text it replaces - so the
     answer reads exactly as before and every wording check still holds. A name is linked once: a second
     mention of the same record in the same answer stays plain rather than pointing at the same place
     twice. */
  function appendBodyText(body, text, links) {
    const value = String(text);
    const pending = toArray(links).filter(
      (entry) => textOf(entry && entry.text).trim() && textOf(entry && entry.href).trim()
    );
    if (!pending.length) {
      body.textContent = value;
      return;
    }
    let cursor = 0;
    while (cursor < value.length) {
      let bestIndex = -1;
      let best = null;
      for (const entry of pending) {
        const index = value.indexOf(entry.text, cursor);
        if (index < 0) continue;
        if (bestIndex < 0 || index < bestIndex || (index === bestIndex && entry.text.length > best.text.length)) {
          bestIndex = index;
          best = entry;
        }
      }
      if (bestIndex < 0) break;
      const before = createTextNode(value.slice(cursor, bestIndex));
      if (before) body.appendChild(before);
      const anchor = createLink({ href: best.href, label: best.text });
      const plain = anchor || createTextNode(best.text);
      if (plain) body.appendChild(plain);
      cursor = bestIndex + best.text.length;
      pending.splice(pending.indexOf(best), 1);
    }
    const rest = createTextNode(value.slice(cursor));
    if (rest) body.appendChild(rest);
  }

  function appendMessage(role, text, link, links) {
    if (!state.log) return null;
    const node = createElement("p", "argo-message");
    if (!node) return null;
    const isUser = role === "user";
    if (node.classList && typeof node.classList.add === "function") {
      node.classList.add(isUser ? "is-user" : "is-argo");
    }
    const who = createElement("span", "argo-message-who");
    if (who) {
      who.textContent = isUser ? t("argo.whoYou") : t("argo.whoArgo");
      node.appendChild(who);
    }
    const body = createElement("span", "argo-message-body");
    if (body) {
      const value = link ? `${String(text)}\n` : String(text);
      /* The record links sit inside the answer itself; the section link stays where it always was, on its
         own line at the end. */
      appendBodyText(body, value, links);
      const anchor = link ? createLink(link) : null;
      if (anchor) body.appendChild(anchor);
      node.appendChild(body);
    }
    state.log.appendChild(node);
    state.messages.push(node);
    if (typeof state.log.scrollTop === "number") state.log.scrollTop = state.log.scrollHeight;
    return node;
  }

  function clearMessages() {
    for (const node of state.messages) {
      if (typeof node.remove === "function") {
        node.remove();
        continue;
      }
      const parent = node.parentNode;
      if (parent && typeof parent.removeChild === "function") parent.removeChild(node);
    }
    state.messages = [];
  }

  /* Everything conversation-related lives in memory, so clearing it is all the "privacy" needed: no
     message is ever written anywhere. The wording bags deliberately survive this, so closing the window
     and opening it again cannot replay the same sequence of lines - only the greeting's own record and
     the fact that the conversation is over are kept. */
  function clearConversation() {
    clearMessages();
    if (state.input) state.input.value = "";
    state.conversationId += 1;
  }

  /* --- Answers -------------------------------------------------------------- */

  /* Response wording lives here. Matching and facts belong to shared/sao-argo-engine.js; nothing below
     adds, changes or infers a game fact - it only arranges what the engine returned. */

  /* Builds the numbered keys of one pool, so adding a line is a dictionary edit and nothing here has
     to change. Every pool name below matches a run of keys in shared/sao-i18n.js (en/es/fr). */
  function poolKeys(prefix, count) {
    return Object.freeze(Array.from({ length: count }, (_value, index) => `${prefix}.${index + 1}`));
  }

  /* The greetings. Their own pool: welcome wording is never mixed with answer wording. */
  const INTRO_KEYS = poolKeys("argo.intro", 10);

  /* Lead-ins, one pool per answer category. The four set categories have their own, because a list
     answer needs a real introduction rather than a bare heading. */
  const LEAD_POOLS = Object.freeze({
    item: poolKeys("argo.lead.item", 20),
    recipe: poolKeys("argo.lead.recipe", 12),
    mob: poolKeys("argo.lead.mob", 20),
    mobDrops: poolKeys("argo.lead.mobDrops", 14),
    drop: poolKeys("argo.lead.drop", 14),
    npc: poolKeys("argo.lead.npc", 12),
    quest: poolKeys("argo.lead.quest", 14),
    location: poolKeys("argo.lead.location", 14),
    collection: poolKeys("argo.lead.collection", 6),
    ranking: poolKeys("argo.lead.ranking", 6),
    comparison: poolKeys("argo.lead.comparison", 6),
    farming: poolKeys("argo.lead.farming", 6)
  });

  /* Transitions into the fact list, one pool per category. */
  const FACT_POOLS = Object.freeze({
    item: poolKeys("argo.facts.item", 3),
    recipe: poolKeys("argo.facts.recipe", 3),
    mob: poolKeys("argo.facts.mob", 3),
    mobDrops: poolKeys("argo.facts.mobDrops", 3),
    drop: poolKeys("argo.facts.drop", 3),
    npc: poolKeys("argo.facts.npc", 3),
    quest: poolKeys("argo.facts.quest", 3),
    location: poolKeys("argo.facts.location", 3)
  });

  /* Sign-offs. A single-record answer signs off with the shared pool: those lines carry no category
     vocabulary, because "it's all from the records" fits any one record. A list answer gets its own
     remark instead of borrowing that one, so a collection does not close like a single lookup. */
  const CLOSE_KEYS = poolKeys("argo.close", 12);
  const SET_CLOSE_POOLS = Object.freeze({
    collection: poolKeys("argo.close.collection", 4),
    ranking: poolKeys("argo.close.ranking", 4),
    comparison: poolKeys("argo.close.comparison", 4),
    farming: poolKeys("argo.close.farming", 4)
  });

  /* Question outcomes and the help text. */
  const STATUS_POOLS = Object.freeze({
    ambiguous: poolKeys("argo.status.ambiguous", 8),
    missing: poolKeys("argo.status.missing", 8),
    unsupported: poolKeys("argo.status.unsupported", 8),
    datasetUnsupported: poolKeys("argo.status.datasetUnsupported", 4),
    error: poolKeys("argo.status.error", 4),
    engineMissing: poolKeys("argo.status.engineMissing", 4),
    candidates: poolKeys("argo.status.candidates", 3),
    emptySet: poolKeys("argo.status.emptySet", 3),
    help: poolKeys("argo.help.body", 4)
  });

  /* Engine data-quality notes worth explaining, each with a small pool of natural phrasings. The
     informational notes are intentionally absent so they never turn into noise, and none of these
     sentences names a dataset, a file or any other implementation detail. */
  const NOTE_POOLS = Object.freeze({
    "item-record-missing": poolKeys("argo.note.itemRecordMissing", 3),
    "bestiary-record-missing": poolKeys("argo.note.bestiaryRecordMissing", 3),
    "no-drop-record": poolKeys("argo.note.noDropRecord", 3),
    "crafting-resources-absent": poolKeys("argo.note.noRecipe", 3),
    "crafting-location-absent": poolKeys("argo.note.noCraftingLocation", 3),
    "stats-absent": poolKeys("argo.note.noStats", 3),
    "no-spawn-area-recorded": poolKeys("argo.note.noSpawnArea", 3),
    "merchant-marker-not-found": poolKeys("argo.note.markerNotFound", 3),
    "quest-entry-missing": poolKeys("argo.note.questMarkerOnly", 3),
    "quest-spans-islands": poolKeys("argo.note.otherIsland", 3),
    "absence-not-proof": poolKeys("argo.note.absenceNotProof", 3),
    "english-questions-only": poolKeys("argo.note.englishOnly", 3),
    "floor-inferred": poolKeys("argo.note.floorInferred", 3),
    /* Stage 5: the caveats a set question, a ranking, a comparison or a farming answer can carry. */
    "other-floor-records-exist": poolKeys("argo.note.otherFloorRecords", 3),
    "ranking-has-unknown-values": poolKeys("argo.note.rankingUnknown", 3),
    "chance-not-recorded": poolKeys("argo.note.chanceNotRecorded", 3),
    "no-recorded-drop-rate": poolKeys("argo.note.noRecordedRate", 3),
    "comparison-truncated": poolKeys("argo.note.comparisonTruncated", 3)
  });

  /* The values a note needs, read from the facts the engine returned - never invented here. */
  function noteParams(note, result) {
    const facts = result.facts || {};
    if (note === "other-floor-records-exist") {
      const entries = toArray(facts.otherFloors);
      return {
        count: entries.reduce((total, entry) => total + (Number(entry.count) || 0), 0),
        floors: joinLimited(
          entries.map((entry) => floorLabel(entry.floor)),
          3
        )
      };
    }
    if (note === "ranking-has-unknown-values") return { count: Number(facts.unknownCount) || 0 };
    if (note === "comparison-truncated") return { count: Number(facts.rowCount) || 0 };
    /* The cross-floor caveat is named after the floor the record was found on. The number is read from
       the result's own context here as well, so this wording can never render an unfilled {floor}
       whichever path reaches it. */
    if (note === "floor-inferred") return { floor: floorNumber(result.context && result.context.floor) };
    return {};
  }

  /* Engine source keys -> the site's own section names (no new vocabulary is invented). */
  const SOURCE_LABEL_KEYS = Object.freeze({
    bestiary: "ui.nav.bestiary",
    equipment: "ui.nav.equipment",
    markers: "ui.nav.maps",
    mobAreas: "ui.nav.maps",
    quests: "ui.nav.quests",
    compendium: "ui.nav.equipment"
  });

  /* English fallbacks for those section names, for a page without the dictionary. */
  const SOURCE_FALLBACKS = Object.freeze({
    bestiary: "Bestiary",
    equipment: "Equipment",
    markers: "Map",
    mobAreas: "Map",
    quests: "Quests",
    compendium: "Equipment"
  });

  const TYPE_KEYS = Object.freeze({
    item: "argo.type.item",
    mob: "argo.type.mob",
    boss: "argo.type.boss",
    npc: "argo.type.npc",
    merchant: "argo.type.merchant",
    location: "argo.type.location",
    dungeon: "argo.type.dungeon",
    quest: "argo.type.quest"
  });

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function textOf(value) {
    return typeof value === "string" ? value : "";
  }

  function uniqueStrings(values) {
    const seen = new Set();
    const output = [];
    for (const value of values) {
      const text = textOf(value).trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      output.push(text);
    }
    return output;
  }

  /* A real number only. A field that is simply absent - null, undefined, an empty string, a boolean -
     is not a number, so a record without a level is never rendered as "Lv null" and a marker without
     coordinates never as "X: null Z: null". Numeric strings still count, so the datasets may carry
     either. */
  function isNumber(value) {
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    return trimmed !== "" && Number.isFinite(Number(trimmed));
  }

  /* --- What is remembered between visits ------------------------------------- */

  /* The only thing Argo ever writes: which greetings were already shown, and the last line drawn from
     each answer pool. It is one small JSON value in the site's own storage helper, which already falls
     back to cookies and then to memory - and every read and write here is guarded, so a page with no
     usable storage simply loses the memory and keeps working exactly as before. */
  const DIALOGUE_STORAGE_KEY = "sao.argo.dialogue";
  const INTRO_HISTORY_LIMIT = 5;

  function dialogueStorage() {
    const storage = global.SAOStorage;
    if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") return null;
    return storage;
  }

  /* Reads the record once and caches it. Anything unreadable, of the wrong shape or of the wrong type
     is treated as "nothing remembered yet" rather than trusted. */
  function readDialogueMemory() {
    if (state.dialogueMemory) return state.dialogueMemory;
    const memory = { intro: [], pools: {} };
    state.dialogueMemory = memory;
    const storage = dialogueStorage();
    if (!storage) return memory;
    let raw = null;
    try {
      raw = storage.getItem(DIALOGUE_STORAGE_KEY);
    } catch (_error) {
      return memory;
    }
    if (typeof raw !== "string" || !raw) return memory;
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (_error) {
      return memory;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return memory;
    memory.intro = toArray(parsed.intro)
      .filter((key) => typeof key === "string" && key)
      .slice(0, INTRO_HISTORY_LIMIT);
    const pools = parsed.pools;
    if (pools && typeof pools === "object" && !Array.isArray(pools)) {
      for (const [name, index] of Object.entries(pools)) {
        if (name && Number.isInteger(index) && index >= 0) memory.pools[name] = index;
      }
    }
    return memory;
  }

  /* Writes the record back, and never lets a full or blocked store reach the visitor. */
  function writeDialogueMemory() {
    const storage = dialogueStorage();
    if (!storage || !state.dialogueMemory) return;
    try {
      storage.setItem(DIALOGUE_STORAGE_KEY, JSON.stringify(state.dialogueMemory));
    } catch (_error) {
      /* Nothing to do: the answer has already been given. */
    }
  }

  /* Called once per reply rather than once per line, so a chatty answer costs one small write. */
  function flushDialogueMemory() {
    if (!state.dialogueDirty) return;
    state.dialogueDirty = false;
    writeDialogueMemory();
  }

  /* --- Selection ------------------------------------------------------------ */

  /* Real randomness with a memory. Each pool keeps a bag of the lines it has not drawn yet, so every
     variant is seen once before any of them comes back, and the line drawn last stays out of the
     refilled bag so even a wrap cannot repeat it. Bags are per pool, so one category can never disturb
     another's rotation, and a pool of one line always returns that line. */
  function randomUnit() {
    const source = typeof state.randomSource === "function" ? state.randomSource : Math.random;
    let value = 0;
    try {
      value = Number(source());
    } catch (_error) {
      value = 0;
    }
    if (!Number.isFinite(value)) return 0;
    return Math.min(Math.max(value, 0), 0.999999999);
  }

  function bagFor(name) {
    if (!state.poolBags[name]) {
      /* The remembered pick seeds the bag, so the first line drawn after a reload is not the line the
         visitor was reading when they reloaded. */
      const remembered = readDialogueMemory().pools[name];
      state.poolBags[name] = { remaining: [], last: Number.isInteger(remembered) ? remembered : -1 };
    }
    return state.poolBags[name];
  }

  /* Refills a bag with every index, leaving out the one drawn last so a wrap cannot repeat it. */
  function refillBag(bag, size) {
    bag.remaining = Array.from({ length: size }, (_value, index) => index);
    const previous = bag.remaining.indexOf(bag.last);
    if (previous >= 0) bag.remaining.splice(previous, 1);
  }

  /* Consumes one index, so it cannot come back until the bag is refilled, and records it as the last
     line drawn - in memory now and in the visitor's storage when the reply is finished. */
  function takeFromBag(name, bag, index) {
    bag.remaining = bag.remaining.filter((entry) => entry !== index);
    bag.last = index;
    readDialogueMemory().pools[name] = index;
    state.dialogueDirty = true;
    return index;
  }

  function drawIndex(name, size) {
    if (size <= 1) return 0;
    const bag = bagFor(name);
    if (!bag.remaining.length) refillBag(bag, size);
    const slot = Math.floor(randomUnit() * bag.remaining.length);
    return takeFromBag(name, bag, bag.remaining[slot]);
  }

  /* Takes the next line from a pool. */
  function nextFromPool(name, keys, params) {
    if (!keys || !keys.length) return "";
    return t(keys[drawIndex(name, keys.length)], params);
  }

  /* Words too common to name anything on their own, so an overlap between two of them is not a
     repetition. Only used to stop an opener and the transition under it saying the same thing twice, so
     the list holds only words that cannot carry the repetition themselves: "have", "has" and "got" are
     deliberately absent, because "what I've got written down" over "here's what I've got" does repeat. */
  const ECHO_STOP_WORDS = Object.freeze(
    new Set(
      (
        "this that these those there their here what which with let lets you your the and for " +
        "from about into just well more some than then them they when where will would could should only " +
        "over under same also very much many come comes like right sure now " +
        "que qui quoi avec pour dans sur les des une est sont plus tout tous bien donc alors voila " +
        "con por para los las una sin mas muy todo todos esta este esto esos esas aqui vamos"
      ).split(/\s+/)
    )
  );

  /* The words of a line that name something. Accents are kept, so a Spanish or French line is compared
     by its own words rather than being folded into English. */
  function topicWords(text) {
    const words = new Set();
    for (const word of textOf(text)
      .toLowerCase()
      .split(/[^a-z0-9\u00e0-\u00ff]+/)) {
      if (word.length < 4 || ECHO_STOP_WORDS.has(word)) continue;
      words.add(word);
    }
    return words;
  }

  function sharesTopic(one, other) {
    for (const word of one) {
      if (other.has(word)) return true;
    }
    return false;
  }

  /* A transition that does not echo the line above it. The bag is preferred, so nothing is consumed
     early; if every line still in the bag echoes, the rest of the pool is tried, so an echoing line is
     avoided whenever the pool holds a better one. The line drawn last is never repeated, and when every
     line in the pool echoes - or the pool holds a single line - the ordinary draw is used, so no variant
     is ever lost. */
  function nextFromPoolAvoidingEcho(name, keys, openText) {
    if (!keys || keys.length < 2 || !openText) return nextFromPool(name, keys);
    const open = topicWords(openText);
    if (!open.size) return nextFromPool(name, keys);
    const bag = bagFor(name);
    if (!bag.remaining.length) refillBag(bag, keys.length);
    const free = (index) => !sharesTopic(topicWords(t(keys[index])), open);
    const fromBag = bag.remaining.find(free);
    if (fromBag !== undefined) {
      takeFromBag(name, bag, fromBag);
      return t(keys[fromBag]);
    }
    const elsewhere = keys.findIndex((_key, index) => index !== bag.last && free(index));
    if (elsewhere >= 0) {
      takeFromBag(name, bag, elsewhere);
      return t(keys[elsewhere]);
    }
    return nextFromPool(name, keys);
  }

  function joinLimited(values, limit) {
    const list = uniqueStrings(values);
    if (!list.length) return "";
    if (list.length <= limit) return list.join(" · ");
    return `${list.slice(0, limit).join(" · ")} …`;
  }

  function entityName(result) {
    const entity = result && result.entity;
    return textOf(entity && entity.name).trim();
  }

  function coordinatesLabel() {
    return translate("page.maps.coordinates", "Coordinates");
  }

  function coordinatesText(coords) {
    if (!coords || !isNumber(coords.x) || !isNumber(coords.z)) return "";
    return `X: ${coords.x} Z: ${coords.z}`;
  }

  /* How wide a labelled line may get before it stops being scannable. Most Current records carry more
     stats, drops or requirement steps than fit on one readable line, and the tail of a wrapped line
     reads as a fresh fact unless it is visibly attached to its label, so a long list is broken at item
     boundaries and the continuation is indented under the label. */
  const LABEL_LINE_WIDTH = 80;
  const LABEL_CONTINUATION = "  ";

  /* "Label: a · b · c" while that stays readable, then the remaining items on indented continuation
     lines. A list that fits is returned exactly as it always was, so short answers are untouched and
     nothing is ever dropped: the items are the same strings, only the line breaks differ. */
  function labelledLines(labelKey, value) {
    const text = textOf(value).trim();
    if (!text) return [];
    const head = `${t(labelKey)}: `;
    const lines = [];
    let current = "";
    for (const part of text.split(" · ")) {
      const joined = current ? `${current} · ${part}` : part;
      const prefix = lines.length ? LABEL_CONTINUATION : head;
      if (current && prefix.length + joined.length > LABEL_LINE_WIDTH) {
        lines.push(current);
        current = part;
        continue;
      }
      current = joined;
    }
    if (current) lines.push(current);
    return lines.map((line, index) => (index === 0 ? head + line : LABEL_CONTINUATION + line));
  }

  function truncate(value, maxLength) {
    const text = textOf(value).replace(/\s+/g, " ").trim();
    if (!text || text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
  }

  function firstLines(value, count) {
    const lines = textOf(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) return "";
    if (lines.length <= count) return lines.join(" · ");
    return `${lines.slice(0, count).join(" · ")} …`;
  }

  function formatStats(stats) {
    if (!stats || typeof stats !== "object") return "";
    return joinLimited(
      Object.entries(stats).map(([key, value]) => `${key} ${value}`),
      6
    );
  }

  function formatResources(resources) {
    return joinLimited(
      toArray(resources).map((resource) => {
        const amount = isNumber(resource.amount) ? ` x${resource.amount}` : "";
        return `${resource.item}${amount}`;
      }),
      6
    );
  }

  function formatDrops(drops) {
    return joinLimited(
      toArray(drops).map((drop) => {
        const chance = isNumber(drop.chance) ? ` (${drop.chance}%)` : "";
        return `${drop.item}${chance}`;
      }),
      8
    );
  }

  function formatDroppedBy(rows) {
    return joinLimited(
      toArray(rows).map((row) => {
        const chance = isNumber(row.chance) ? ` (${row.chance}%)` : "";
        return `${row.mob}${chance}`;
      }),
      5
    );
  }

  /* Equipment categories are the site's own list titles, so they localize with the page's vocabulary.
     The fallback reads the raw dataset key as a readable title. */
  function categoryLabel(category) {
    const value = textOf(category).trim();
    if (!value) return "";
    return translate(`page.ecompendium.listTitles.${value}`, titleCase(value));
  }

  function titleCase(value) {
    return textOf(value)
      .replace(/[_-]+/g, " ")
      .replace(/\b[a-z]/g, (character) => character.toUpperCase());
  }

  /* Aincrad floors are floor1..floor3; the Underworld reuses the same field for island ids, which the
     Main UI already labels. */
  function floorNumber(floor) {
    const match = /^floor([123])$/.exec(textOf(floor).trim());
    return match ? match[1] : "";
  }

  function floorLabel(floor) {
    const value = textOf(floor).trim();
    if (!value) return "";
    const number = floorNumber(value);
    if (number) return t("argo.label.floor", { floor: number });
    const islandKey = `page.mainui.islandOptions.${value}`;
    const islandLabel = translate(islandKey, "");
    return islandLabel && islandLabel !== islandKey ? islandLabel : value;
  }

  /* --- Answer bodies (one per engine intent) -------------------------------- */

  /* The Bestiary's own tab titles, so a mob's tab reads like the Bestiary page. */
  const BESTIARY_TAB_KEYS = Object.freeze({
    boss: "page.bestiary.listTitleBoss",
    regular: "page.bestiary.listTitleRegular",
    dungeonBoss: "page.bestiary.listTitleDungeonBoss",
    dungeonMobs: "page.bestiary.listTitleDungeonMobs"
  });

  function headerLine(name, record) {
    const details = [];
    const category = categoryLabel(record.category);
    if (category) details.push(category);
    if (isNumber(record.level)) details.push(t("argo.label.level", { level: record.level }));
    if (record.set) details.push(record.set);
    if (!details.length) return name;
    return `${name} — ${details.join(" · ")}`;
  }

  /* One coordinate line per marker, skipping a title that only repeats the entity name. */
  function markerLines(markers, limit, name) {
    return toArray(markers)
      .slice(0, limit)
      .map((marker) => {
        const coords = coordinatesText(marker.coords);
        if (!coords) return "";
        const title = textOf(marker.title).trim();
        const suffix = title && title !== name ? ` (${title})` : "";
        return `${coordinatesLabel()}: ${coords}${suffix}`;
      });
  }

  /* "Secret Sticky Ring Merchant (X: 390 Z: 3064)" when the documented location has a map marker. */
  function craftingLocationText(location, marker) {
    const name = textOf(location).trim();
    if (!name) return "";
    const coords = marker ? coordinatesText(marker.coords) : "";
    return coords ? `${name} (${coords})` : name;
  }

  /* --- Answer structures ----------------------------------------------------- */

  /* A multi-fact answer is built from named blocks that each hold one confirmed field. A structure is
     an ordered list of those block names: it decides how the answer is grouped and what the visitor
     reads first, and nothing else. Every structure of a category names the same blocks, so the facts
     are identical whichever one is used; a block the record does not have is an empty list, so a layout
     can never leave a blank line or force an empty section into the answer. */
  const ANSWER_STRUCTURES = Object.freeze({
    /* Equipment: what it is and what it does, then how it is obtained. */
    item: Object.freeze({
      identity: Object.freeze(["header", "description", "stats", "resources", "location", "droppedBy"]),
      acquisition: Object.freeze(["header", "location", "resources", "droppedBy", "stats", "description"])
    }),
    /* A mob: its stats and loot, then where it lives - or the hunting grounds first and the loot after. */
    mob: Object.freeze({
      identity: Object.freeze(["name", "bestiary", "drops", "spawnArea", "coordinates"]),
      hunting: Object.freeze(["name", "spawnArea", "coordinates", "bestiary", "drops"])
    }),
    /* A quest: who hands it out and where, then the job - or the job and its pay first, the logistics
       after. */
    quest: Object.freeze({
      identity: Object.freeze(["name", "npc", "coordinates", "requirements", "rewards", "marker"]),
      briefing: Object.freeze(["name", "requirements", "rewards", "npc", "coordinates", "marker"])
    })
  });

  /* The blocks each structure may lead with. A structure is only offered when the record actually has
     one of them, so an answer never opens on a blank line. */
  const STRUCTURE_LEADS = Object.freeze({
    item: Object.freeze({ identity: ["header"], acquisition: ["location", "resources", "droppedBy"] }),
    mob: Object.freeze({ identity: ["name"], hunting: ["spawnArea", "coordinates"] }),
    quest: Object.freeze({ identity: ["name"], briefing: ["requirements", "rewards"] })
  });

  /* One bag per category, named here so a category's layout rotation is its own. */
  const STRUCTURE_POOLS = Object.freeze({
    item: "structure.item",
    mob: "structure.mob",
    quest: "structure.quest"
  });

  function structureKeys(kind, blocks) {
    const structures = ANSWER_STRUCTURES[kind];
    const declared = Object.keys(structures);
    const leads = STRUCTURE_LEADS[kind];
    const offered = declared.filter((key) => leads[key].some((block) => blocks[block].length > 0));
    return offered.length ? offered : declared.slice(0, 1);
  }

  /* Two identical questions read differently while every confirmed value stays the same. A record with
     only one usable layout draws nothing, so it cannot disturb the rotation for the records that do
     have a choice. */
  function pickStructure(kind, blocks) {
    const keys = structureKeys(kind, blocks);
    const structures = ANSWER_STRUCTURES[kind];
    if (keys.length <= 1) return structures[keys[0]] || structures[Object.keys(structures)[0]];
    return structures[keys[drawIndex(STRUCTURE_POOLS[kind], keys.length)]] || structures[keys[0]];
  }

  /* Renders a category's blocks in the order the chosen structure names. An empty block contributes no
     line, so a field the record does not have can never leave a gap. */
  function structuredBody(kind, blocks) {
    const lines = [];
    for (const key of pickStructure(kind, blocks)) lines.push(...blocks[key]);
    return lines;
  }

  /* An item's confirmed fields, each produced once. `header` carries the name, category, level and set;
     the rest are the record's own fields, present only when the record has them. */
  function itemBlocks(result) {
    const facts = result.facts || {};
    const record = facts.record;
    const header = headerLine(entityName(result), record);
    const description = truncate(record.description, 160);
    const stats = formatStats(record.stats);
    const resources = formatResources(record.craftingResources);
    const location = craftingLocationText(record.craftingLocation, facts.craftingLocationMarker);
    const droppedBy = formatDroppedBy(facts.droppedBy);
    return {
      header: header ? [header] : [],
      description: description ? [description] : [],
      stats: labelledLines("argo.label.stats", stats),
      resources: labelledLines("argo.label.craftingResources", resources),
      location: labelledLines("argo.label.craftingLocation", location),
      droppedBy: labelledLines("argo.label.droppedBy", droppedBy)
    };
  }

  function itemBody(result) {
    const facts = result.facts || {};
    /* A drop-only item is a name and its documented origins: one line of provenance and no second
       reading order to choose from, so it is returned exactly as it always was. */
    if (!facts.record) {
      const name = entityName(result);
      const lines = name ? [name] : [];
      const droppedBy = formatDroppedBy(facts.droppedBy);
      lines.push(...labelledLines("argo.label.droppedBy", droppedBy));
      return lines;
    }
    return structuredBody("item", itemBlocks(result));
  }

  function recipeBody(result) {
    const facts = result.facts || {};
    const lines = [entityName(result)];
    const resources = formatResources(facts.craftingResources);
    lines.push(...labelledLines("argo.label.craftingResources", resources));
    const location = craftingLocationText(facts.craftingLocation, facts.craftingLocationMarker);
    lines.push(...labelledLines("argo.label.craftingLocation", location));
    return lines;
  }

  /* A mob's confirmed fields: its Bestiary line, its drop list, its spawn areas and its map marks. */
  function mobBlocks(result) {
    const facts = result.facts || {};
    const name = entityName(result);
    const bestiary = facts.bestiary;
    const details = [];
    if (bestiary) {
      const tabKey = BESTIARY_TAB_KEYS[textOf(bestiary.tab)];
      if (tabKey) details.push(translate(tabKey, titleCase(bestiary.tab)));
      if (bestiary.xp) details.push(`XP ${bestiary.xp}`);
    }
    const drops = formatDrops(facts.drops);
    const areas = joinLimited(
      toArray(facts.spawnAreas).map((area) => area.area),
      4
    );
    return {
      name: name ? [name] : [],
      bestiary: details.length ? [details.join(" · ")] : [],
      drops: labelledLines("argo.label.drops", drops),
      spawnArea: labelledLines("argo.label.spawnArea", areas),
      coordinates: markerLines(facts.markers, 2, name).filter(Boolean)
    };
  }

  function mobBody(result) {
    return structuredBody("mob", mobBlocks(result));
  }

  function mobDropsBody(result) {
    const facts = result.facts || {};
    const lines = [textOf(facts.mob).trim() || entityName(result)];
    const details = [];
    const tabKey = BESTIARY_TAB_KEYS[textOf(facts.bestiaryTab)];
    if (tabKey) details.push(translate(tabKey, titleCase(facts.bestiaryTab)));
    if (facts.xp) details.push(`XP ${facts.xp}`);
    if (details.length) lines.push(details.join(" · "));
    const drops = formatDrops(facts.drops);
    lines.push(...labelledLines("argo.label.drops", drops));
    return lines;
  }

  function dropBody(result) {
    const facts = result.facts || {};
    const lines = [textOf(facts.item).trim() || entityName(result)];
    const droppedBy = formatDroppedBy(facts.droppedBy);
    lines.push(...labelledLines("argo.label.droppedBy", droppedBy));
    return lines;
  }

  function npcBody(result) {
    const facts = result.facts || {};
    const name = entityName(result);
    const markers = toArray(facts.markers);
    const lines = [name];
    const description = markers.map((marker) => textOf(marker.description).trim()).find(Boolean);
    if (description && description !== name) lines.push(truncate(description, 160));
    markerLines(markers, 3, name).forEach((line) => lines.push(line));
    const sells = joinLimited(
      toArray(facts.sells).map((entry) => entry.item),
      5
    );
    lines.push(...labelledLines("argo.label.sells", sells));
    const quests = joinLimited(
      toArray(facts.appearsIn).map((quest) => quest.questName),
      4
    );
    lines.push(...labelledLines("argo.label.quests", quests));
    return lines;
  }

  /* A quest's confirmed fields: its numbered title, the NPC who hands it out, its coordinate string, the
     documented requirements and rewards, and its map mark. */
  function questBlocks(result) {
    const facts = result.facts || {};
    const name = entityName(result);
    const quest = toArray(facts.quests)[0];
    const title = quest.questNumber ? `${quest.questNumber}. ${quest.questName}` : textOf(quest.questName) || name;
    const requirements = firstLines(quest.requirements, 2);
    const rewards = joinLimited(
      [quest.xpReward ? `XP ${quest.xpReward}` : "", quest.colReward ? `Col ${quest.colReward}` : "", quest.bonusItems],
      3
    );
    return {
      name: title ? [title] : [],
      npc: labelledLines("argo.label.npc", quest.npcName),
      coordinates: quest.coordinates ? [`${coordinatesLabel()}: ${quest.coordinates}`] : [],
      requirements: labelledLines("argo.label.requirements", requirements),
      rewards: labelledLines("argo.label.rewards", rewards),
      marker: markerLines(facts.markers, 1, name).filter(Boolean)
    };
  }

  function questBody(result) {
    const facts = result.facts || {};
    /* A quest with no sheet recorded yet is a name and its map mark: one order only. */
    if (!toArray(facts.quests).length) {
      const name = entityName(result);
      const lines = name ? [name] : [];
      markerLines(facts.markers, 2, name)
        .filter(Boolean)
        .forEach((line) => lines.push(line));
      return lines;
    }
    return structuredBody("quest", questBlocks(result));
  }

  /* A location's confirmed fields, each produced once and kept in its own list. A field the record does
     not have stays an empty list, so a layout can never leave a blank line or force an empty section
     into the answer. */
  function locationBlocks(result) {
    const facts = result.facts || {};
    const name = entityName(result);
    const markers = toArray(facts.markers);
    const description = markers.map((marker) => textOf(marker.description).trim()).find(Boolean);
    const spawnArea = labelledLines(
      "argo.label.spawnArea",
      joinLimited(
        toArray(facts.areas).map((area) => area.title),
        3
      )
    );
    const mobs = labelledLines(
      "argo.label.mobs",
      joinLimited(
        toArray(facts.mobs).map((mob) => mob.mob),
        8
      )
    );
    return {
      name: name ? [name] : [],
      description: description && description !== name ? [truncate(description, 160)] : [],
      /* A marker without coordinates contributes no line at all. */
      coordinates: markerLines(markers, 3, name).filter(Boolean),
      spawnArea,
      mobs
    };
  }

  /* The reading orders a location answer can take. Both carry exactly the same blocks in the same
     grouping - they differ only in what the visitor reads first, which is the whole point of having
     more than one. No line is added or invented by either order. */
  const LOCATION_STRUCTURES = Object.freeze({
    /* The place itself: what it is called, what it looks like, then where it is. */
    identity: (blocks) => [
      ...blocks.name,
      ...blocks.description,
      ...blocks.coordinates,
      ...blocks.spawnArea,
      ...blocks.mobs
    ],
    /* The way there: the coordinates lead, and the name and description follow them. */
    directions: (blocks) => [
      ...blocks.coordinates,
      ...blocks.name,
      ...blocks.description,
      ...blocks.spawnArea,
      ...blocks.mobs
    ]
  });

  /* The block each order leads with, so an order is only offered when the record actually has that
     field: an answer never opens on a blank line. */
  const LOCATION_STRUCTURE_LEADS = Object.freeze({ identity: "name", directions: "coordinates" });

  /* The cursor that rotates the reading order. It lives with the conversation's other cursors, so it
     resets with the conversation and nothing is remembered between visits. */
  /* One bag for the location layouts, named here so it cannot collide with the category pools. */
  const LOCATION_STRUCTURE_POOL = "structure.location";

  function locationStructureKeys(blocks) {
    const declared = Object.keys(LOCATION_STRUCTURES);
    const offered = declared.filter((key) => blocks[LOCATION_STRUCTURE_LEADS[key]].length > 0);
    return offered.length ? offered : declared.slice(0, 1);
  }

  /* Two identical questions read differently while every confirmed value stays the same. A record with
     only one usable order draws nothing, so it cannot disturb the rotation for the records that do
     have a choice. */
  function pickLocationStructure(blocks) {
    const keys = locationStructureKeys(blocks);
    if (keys.length <= 1) return LOCATION_STRUCTURES[keys[0]] || LOCATION_STRUCTURES.identity;
    return LOCATION_STRUCTURES[keys[drawIndex(LOCATION_STRUCTURE_POOL, keys.length)]] || LOCATION_STRUCTURES.identity;
  }

  function locationBody(result) {
    const blocks = locationBlocks(result);
    return pickLocationStructure(blocks)(blocks);
  }

  /* --- Stage 5 bodies: collections, rankings, comparisons and farming -------- */

  /* How many records the window lists before it says how many are left. The engine returns every match, so
     this is only about how much text one chat line can carry - and the total is always stated. */
  const COLLECTION_DISPLAY_LIMIT = 10;
  const SOURCE_DISPLAY_LIMIT = 6;

  /* What a collection or ranking is about, in the site's own vocabulary. */
  const TARGET_LABEL_KEYS = Object.freeze({
    quest: "argo.label.target.quest",
    boss: "argo.label.target.boss",
    mob: "argo.label.target.mob",
    item: "argo.label.target.item",
    npc: "argo.label.target.npc",
    location: "argo.label.target.location",
    dungeon: "argo.label.target.dungeon",
    area: "argo.label.target.area"
  });
  const TARGET_LABEL_FALLBACKS = Object.freeze({
    quest: "Quests",
    boss: "Bosses",
    mob: "Mobs",
    item: "Items",
    npc: "NPCs",
    location: "Locations",
    dungeon: "Dungeons",
    area: "Areas"
  });

  /* The Quests page's own tab names, used when the dictionary is unavailable. */
  const QUEST_TYPE_FALLBACKS = Object.freeze({ main: "Main Quests", side: "Side Quests" });

  function questTypeLabel(questType) {
    const value = textOf(questType).trim();
    if (!value) return "";
    return translate(`page.quests.questTypes.${value}`, QUEST_TYPE_FALLBACKS[value] || titleCase(value));
  }

  function bestiaryTabLabel(tab) {
    const value = textOf(tab).trim();
    if (!value) return "";
    const key = BESTIARY_TAB_KEYS[value];
    return key ? translate(key, titleCase(value)) : "";
  }

  /* "Side Quests", "Weapons", "Bosses": the filter the visitor asked for, when there is one. */
  function planLabel(facts) {
    const target = textOf(facts.target);
    const filters = facts.filters || {};
    if (filters.category) return categoryLabel(filters.category);
    if (target === "quest" && filters.questType) return questTypeLabel(filters.questType);
    const key = TARGET_LABEL_KEYS[target];
    return key ? translate(key, TARGET_LABEL_FALLBACKS[target] || target) : "";
  }

  function rankFieldLabel(field, fieldKind) {
    /* A stat key is the dataset's own vocabulary, shown exactly as the pages show it. */
    if (fieldKind === "stat") return field;
    if (field === "level") return t("argo.label.levelField");
    if (field === "xp" || field === "xpReward") return translate("page.quests.tableCols.xpReward", "XP");
    if (field === "colReward") return translate("page.quests.tableCols.colReward", "Col");
    return titleCase(field);
  }

  /* One collection record: the name plus whatever that record actually has. */
  /* One collection record: the name plus whatever that record actually has. An item's own crafting
     location travels with it, so a question about where a set of items comes from answers per item
     rather than implying they share one source. */
  function collectionRecordLine(record) {
    const details = [];
    const questType = questTypeLabel(record.questType);
    if (questType) details.push(questType);
    if (record.category) details.push(categoryLabel(record.category));
    const tab = bestiaryTabLabel(record.bestiaryTab);
    if (tab) details.push(tab);
    if (isNumber(record.level)) details.push(t(`argo.label.level`, { level: record.level }));
    const xp = isNumber(record.xpReward) ? record.xpReward : isNumber(record.xp) ? record.xp : null;
    if (xp !== null) details.push(`XP ${xp}`);
    const craftingLocation = textOf(record.craftingLocation).trim();
    if (craftingLocation) details.push(craftingLocation);
    const coords = coordinatesText(record.coords);
    if (coords) details.push(coords);
    return details.length ? `• ${record.name} (${details.join(" · ")})` : `• ${record.name}`;
  }

  function collectionBody(result, options) {
    const facts = result.facts || {};
    const records = toArray(facts.records);
    if (!records.length) return [];
    const lines = [];
    /* The opener already named the set and how many matched, so the plain count heading would only
       repeat it straight back. Without an opener to carry it - a page whose dictionary has no
       collection lead-ins - the heading stays, so the count is never lost. */
    if (!options || !options.countInLead) {
      lines.push(t("argo.label.recordsFound", { label: planLabel(facts), count: facts.total }));
    }
    records.slice(0, COLLECTION_DISPLAY_LIMIT).forEach((record) => lines.push(collectionRecordLine(record)));
    if (records.length > COLLECTION_DISPLAY_LIMIT) {
      lines.push(
        t("argo.label.moreRecords", {
          count: facts.total - COLLECTION_DISPLAY_LIMIT,
          total: facts.total
        })
      );
    }
    return lines;
  }

  function rankingBody(result) {
    const facts = result.facts || {};
    const ranked = toArray(facts.ranked);
    if (!ranked.length) return [];
    const field = rankFieldLabel(facts.field, facts.fieldKind);
    const direction = translate(
      facts.direction === "asc" ? "argo.label.lowestFirst" : "argo.label.highestFirst",
      facts.direction === "asc" ? "lowest first" : "highest first"
    );
    const lines = [t("argo.label.rankedBy", { label: planLabel(facts), field, direction })];
    ranked.forEach((record, index) => {
      const details = [];
      const questType = questTypeLabel(record.questType);
      if (questType) details.push(questType);
      if (record.category) details.push(categoryLabel(record.category));
      const suffix = details.length ? ` (${details.join(" · ")})` : "";
      lines.push(`${index + 1}. ${record.name} — ${field} ${record.value}${suffix}`);
    });
    return lines;
  }

  /* A comparison row is either a field the site has its own name for, or a dataset stat key. */
  function comparisonRowLabel(row) {
    const key = textOf(row.key);
    switch (row.kind) {
      case "stat":
        return key;
      case "category":
        return t("argo.label.categoryField");
      case "questType":
        return t("argo.label.questType");
      case "bestiaryTab":
        return t("argo.label.bestiaryTab");
      case "entityType":
        return t("argo.label.typeField");
      case "number":
        if (key === "level") return t("argo.label.levelField");
        if (key === "xp" || key === "xpReward") return translate("page.quests.tableCols.xpReward", "XP");
        if (key === "colReward") return translate("page.quests.tableCols.colReward", "Col");
        return titleCase(key);
      default:
        if (key === "npcName") return t("argo.label.npc");
        if (key === "craftingLocation") return t("argo.label.craftingLocation");
        return titleCase(key);
    }
  }

  function comparisonValue(row, value) {
    if (value === null || value === undefined || value === "") return t("argo.label.unknown");
    if (row.kind === "entityType") {
      const typeKey = TYPE_KEYS[textOf(value)];
      return typeKey ? t(typeKey) : textOf(value);
    }
    if (row.kind === "category") return categoryLabel(value);
    if (row.kind === "questType") return questTypeLabel(value) || textOf(value);
    if (row.kind === "bestiaryTab") return bestiaryTabLabel(value) || textOf(value);
    return String(value);
  }

  function comparisonBody(result) {
    const facts = result.facts || {};
    const entities = toArray(facts.entities);
    if (entities.length < 2) return [];
    const lines = [entities.map((entity) => textOf(entity.name)).join(" · ")];
    toArray(facts.rows).forEach((row) => {
      const values = toArray(row.values).map((value) => comparisonValue(row, value));
      lines.push(`${comparisonRowLabel(row)}: ${values.join(" · ")}`);
    });
    return lines;
  }

  /* Farming: the documented sources of an item, best recorded rate first, with the areas those sources are
     documented in. A rate the Bestiary does not record is shown as unknown, never guessed. */
  function farmingBody(result) {
    const facts = result.facts || {};
    const sources = toArray(facts.sources);
    const lines = [textOf(facts.item).trim() || entityName(result)];
    if (facts.best) {
      lines.push(t("argo.label.bestSource", { mob: facts.best.mob, chance: facts.best.chance }));
    }
    sources.slice(0, SOURCE_DISPLAY_LIMIT).forEach((source) => {
      const details = [isNumber(source.chance) ? `${source.chance}%` : t("argo.label.unknown")];
      const tab = bestiaryTabLabel(source.bestiaryTab);
      if (tab) details.push(tab);
      const areas = joinLimited(
        toArray(source.spawnAreas).map((area) => area.area),
        2
      );
      if (areas) details.push(areas);
      lines.push(`• ${source.mob} (${details.join(" · ")})`);
    });
    if (sources.length > SOURCE_DISPLAY_LIMIT) {
      lines.push(
        t("argo.label.moreRecords", { count: facts.sourceCount - SOURCE_DISPLAY_LIMIT, total: facts.sourceCount })
      );
    }
    return lines;
  }

  function helpBody() {
    return [nextFromPool("status.help", STATUS_POOLS.help)];
  }

  const ANSWER_BODIES = Object.freeze({
    item: itemBody,
    recipe: recipeBody,
    mob: mobBody,
    mobDrops: mobDropsBody,
    drop: dropBody,
    npc: npcBody,
    quest: questBody,
    location: locationBody,
    collection: collectionBody,
    ranking: rankingBody,
    comparison: comparisonBody,
    farming: farmingBody,
    help: helpBody
  });

  /* --- Result renderers ----------------------------------------------------- */

  /* The sources each world can actually provide. The Underworld has no Aincrad map, Bestiary or
     equipment and Aincrad has no Underworld Compendium, so a source that cannot exist for the active
     world is not a missing source. Counting one would put the "I can only see…" caveat on every Aincrad
     answer that has nothing to show, which tells the visitor nothing they were not just told. */
  const WORLD_SOURCE_KEYS = Object.freeze({
    aincrad: Object.freeze(["bestiary", "equipment", "markers", "mobAreas", "quests"]),
    underworld: Object.freeze(["compendium", "quests"])
  });

  /* The sources this result's world is expected to have. An unknown world keeps the full list, so an
     older caller that passes no world still gets the conservative behaviour. */
  function expectedSourceKeys(result) {
    const world = textOf(result && result.context && result.context.world)
      .trim()
      .toLowerCase();
    return WORLD_SOURCE_KEYS[world] || Object.keys(SOURCE_LABEL_KEYS);
  }

  /* True when the engine could not see at least one of the sources it can use for this world. */
  function sourcesIncomplete(result) {
    const sources = result && result.sources;
    if (!sources || typeof sources !== "object") return false;
    return expectedSourceKeys(result).some((key) => sources[key] !== true);
  }

  /* Names the sources the engine can actually see, using the site's own section names. */
  function availableSourcesLine(result) {
    const sources = (result && result.sources) || {};
    const labels = expectedSourceKeys(result)
      .filter((key) => sources[key] === true)
      .map((key) => translate(SOURCE_LABEL_KEYS[key], SOURCE_FALLBACKS[key]));
    if (!labels.length) return t("argo.status.noSources");
    return t("argo.status.sourcesAvailable", {
      sources: joinLimited(labels, 6)
    });
  }

  function noteLines(result) {
    const lines = [];
    const notes = toArray(result.dataQuality && result.dataQuality.notes);
    /* A record answered from another floor says so before anything else - and exactly once. The loop
       below has to skip it: its pool exists, so it would otherwise repeat the same caveat a second time
       through the generic path, which has no floor number to fill in. */
    if (notes.includes("floor-inferred")) {
      const number = floorNumber(result.context && result.context.floor);
      if (number)
        lines.push(
          nextFromPool("note.floor-inferred", NOTE_POOLS["floor-inferred"], {
            floor: number
          })
        );
    }
    for (const note of notes) {
      if (note === "floor-inferred") continue;
      const keys = NOTE_POOLS[note];
      if (!keys) continue;
      lines.push(nextFromPool(`note.${note}`, keys, noteParams(note, result)));
      /* Two caveats are plenty; the rest would bury the answer. */
      if (lines.length >= 2) break;
    }
    return lines;
  }

  /* The source-availability caveat, used where it explains why nothing was found. */
  function availabilityLine(result) {
    return sourcesIncomplete(result) ? availableSourcesLine(result) : "";
  }

  /* Every answer that has an opener pool opens with one: a visitor who asks about a record should hear
     Argo speak, not a report being read out. Each category draws from its own bag, so two questions of
     the same kind never read the same way. */
  function leadLine(intent, result) {
    const keys = LEAD_POOLS[intent];
    if (!keys || !keys.length) return "";
    return nextFromPool(`lead.${intent}`, keys, leadParams(intent, result));
  }

  /* The only values an opener may mention: the dataset's own name for the set and how many matched.
     Both must really be there, so a placeholder can never reach the visitor. */
  function leadParams(intent, result) {
    if (intent !== "collection") return null;
    const params = collectionLeadParams(result);
    return params ? { label: params.label, count: params.count } : null;
  }

  /* A collection's opener can carry the count and the label, so the plain count heading is not simply
     repeated after it. Both values are needed before that is allowed. */
  function collectionLeadParams(result) {
    const facts = (result && result.facts) || {};
    const label = planLabel(facts);
    if (!label || !isNumber(facts.total)) return null;
    return { label, count: facts.total };
  }

  /* A transition into the list, and only when there is a list to introduce. It is drawn so that it does
     not repeat the opener directly above it - "let me see what's written down" followed by "here's what's
     written down" reads like a machine filling slots. */
  function factIntroLine(intent, bodyLineCount, openText) {
    if (bodyLineCount < 2) return "";
    const keys = FACT_POOLS[intent];
    if (!keys || !keys.length) return "";
    return nextFromPoolAvoidingEcho(`facts.${intent}`, keys, openText);
  }

  /* A sign-off only lands on an answer that needed no caveat at all: Argo sounds sure of herself when
     the records are solid, and never when something is missing. */
  function closeLine(intent, bodyLineCount, noteLineCount) {
    if (bodyLineCount < 2 || noteLineCount) return "";
    const keys = SET_CLOSE_POOLS[intent];
    if (keys && keys.length) return nextFromPool(`close.${intent}`, keys);
    return nextFromPool("close", CLOSE_KEYS);
  }

  function bodyFor(intent, result, options) {
    const body = ANSWER_BODIES[intent];
    return (typeof body === "function" ? body(result, options) : ANSWER_BODIES.item(result, options)).filter(Boolean);
  }

  function renderAnswer(result) {
    const intent = textOf(result.intent);
    const lead = leadLine(intent, result);
    /* The opener already named the set and its size, so the plain count line would only repeat it. */
    const countInLead = Boolean(lead) && intent === "collection" && Boolean(collectionLeadParams(result));
    const body = bodyFor(intent, result, { countInLead });
    const notes = noteLines(result);
    const lines = [];
    /* An opener introduces something. An answer that turned out to hold no fact and no caveat is not
       opened with a quip on its own - the caller falls back to its error line, exactly as before. */
    if (lead && (body.length || notes.length)) lines.push(lead);
    const intro = factIntroLine(intent, body.length, lead);
    if (intro) lines.push(intro);
    body.forEach((line) => lines.push(line));
    notes.forEach((line) => lines.push(line));
    const close = closeLine(intent, body.length, notes.length);
    if (close) lines.push(close);
    return lines.filter(Boolean).join("\n");
  }

  /* A set question that found nothing is not "a name without details": the list itself came up empty, and
     the caveats around it (another floor holds matches, a source is not loaded) still apply. */
  const EMPTY_SET_INTENTS = Object.freeze(new Set(["collection", "ranking", "comparison"]));

  function missingStatusLine(result) {
    if (EMPTY_SET_INTENTS.has(textOf(result.intent))) {
      return nextFromPool("status.emptySet", STATUS_POOLS.emptySet);
    }
    return nextFromPool("status.missing", STATUS_POOLS.missing);
  }

  function renderMissing(result) {
    const lines = [missingStatusLine(result)];
    bodyFor(textOf(result.intent), result).forEach((line) => lines.push(line));
    noteLines(result).forEach((line) => lines.push(line));
    lines.push(availabilityLine(result));
    return lines.filter(Boolean).join("\n");
  }

  function renderAmbiguous(result) {
    const lines = [nextFromPool("status.ambiguous", STATUS_POOLS.ambiguous)];
    lines.push(nextFromPool("status.candidates", STATUS_POOLS.candidates));
    const options = toArray(result.clarification && result.clarification.options);
    const candidates = options.length ? options : toArray(result.candidates);
    candidates.slice(0, 6).forEach((candidate) => {
      const name = textOf(candidate.name).trim();
      if (!name) return;
      const parts = [];
      const typeKey = TYPE_KEYS[textOf(candidate.type)];
      if (typeKey) parts.push(t(typeKey));
      /* Only a candidate from another floor carries a floor, so the usual list stays unchanged. */
      const floor = floorLabel(candidate.floor);
      if (floor) parts.push(floor);
      lines.push(parts.length ? `• ${name} (${parts.join(" · ")})` : `• ${name}`);
    });
    return lines.filter(Boolean).join("\n");
  }

  /* The active language, used only to be honest about question matching being English-shaped. */
  function activeLanguage() {
    const i18n = global.SAOI18n;
    if (!i18n || typeof i18n.getLanguage !== "function") return "en";
    try {
      return String(i18n.getLanguage() || "en").toLowerCase();
    } catch (_error) {
      return "en";
    }
  }

  function renderUnsupported(result) {
    /* The site is on a dataset Argo does not serve: one clear, in-character line, no records touched
       and no help text that would suggest the question was understood. */
    if (textOf(result.unsupportedReason) === "dataset-unsupported") {
      return nextFromPool("status.datasetUnsupported", STATUS_POOLS.datasetUnsupported);
    }
    const lines = [nextFromPool("status.unsupported", STATUS_POOLS.unsupported)];
    if (textOf(result.unsupportedReason) === "no-entity-match") {
      lines.push(nextFromPool("note.absence-not-proof", NOTE_POOLS["absence-not-proof"]));
    }
    /* The engine matches questions in English, so say so rather than pretending to understand. */
    if (activeLanguage() !== "en") {
      lines.push(nextFromPool("note.english-questions-only", NOTE_POOLS["english-questions-only"]));
    }
    lines.push(nextFromPool("status.help", STATUS_POOLS.help));
    lines.push(availabilityLine(result));
    return lines.filter(Boolean).join("\n");
  }

  /* --- Links to the site's own pages ---------------------------------------- */

  /* The section that answers for a collection or ranking target. */
  const TARGET_SECTIONS = Object.freeze({
    quest: "quests",
    boss: "bestiary",
    mob: "bestiary",
    item: "equipment",
    npc: "maps",
    location: "maps",
    dungeon: "maps",
    area: "maps"
  });

  /* The section names the link label is built from - the site's own navigation vocabulary. */
  const LINK_LABEL_KEYS = Object.freeze({
    maps: "ui.nav.maps",
    bestiary: "ui.nav.bestiary",
    equipment: "ui.nav.equipment",
    quests: "ui.nav.quests",
    compendium: "ui.nav.equipment"
  });

  const LINK_LABEL_FALLBACKS = Object.freeze({
    maps: "Map",
    bestiary: "Bestiary",
    equipment: "Equipment",
    quests: "Quests",
    compendium: "Equipment"
  });

  /* Whether the Bestiary really holds this result's record. The `mob` facts carry the record itself and
     the `mobDrops` facts carry only its tab, so both shapes are read rather than assuming one. */
  function hasBestiaryRecord(intent, facts) {
    if (intent === "mobDrops") return Boolean(textOf(facts.bestiaryTab).trim());
    return Boolean(facts.bestiary);
  }

  /* --- Links to the site's own pages ---------------------------------------- */

  /* Every destination an answer can point at, and what each page really reads:
     - Aincrad/Map/maps.js takes ?floor, ?search and ?categories (parsed in shared/map-runtime.js), and
       hides a marker whose own category is switched off - so a biome has to be enabled to be seen.
     - Aincrad/Bestiary/bestiary.js takes ?floor, ?search and ?category, which is its own list tab, so a
       boss opens on the Boss List rather than the regular one.
     - Aincrad/eCompendium/ecompendium.js takes ?floor, ?search and ?category, its own equipment tab.
     - Aincrad/Quests/quests.js takes ?floor, ?search and ?type.
     No page name, parameter or anchor is invented here. */
  const SEARCHABLE_SECTIONS = Object.freeze(new Set(["maps", "bestiary", "quests", "equipment"]));

  function isFloorAware(world, section) {
    const utils = global.SAOPageUtils;
    if (!utils) return false;
    const aware = world === "underworld" ? utils.UNDERWORLD_FLOOR_AWARE_SECTIONS : utils.FLOOR_AWARE_SECTIONS;
    return Boolean(aware && typeof aware.has === "function" && aware.has(section));
  }

  /* The finished, validated href for one destination. The path is the site's own route and the query is
     built once, so the floor and the record cannot collide; the URL then goes through SAOPageUtils'
     resolver, which rejects anything that is not http(s) on this page's own origin. Without those helpers
     - the Tower Defense page loads none of them - no link is offered at all rather than an unvalidated
     one. Empty parameters are dropped, so a record that carries no category sends none. */
  function sectionHref(world, section, params, floor) {
    const utils = global.SAOPageUtils;
    if (!utils || typeof utils.buildQueryUrl !== "function" || typeof utils.resolveSafeInternalHref !== "function") {
      return null;
    }
    const paths = world === "underworld" ? utils.UNDERWORLD_SECTION_PATHS : utils.SECTION_PATHS;
    const path = paths && paths[section];
    if (!path || path === "#") return null;
    const query = {};
    /* The floor comes first, so a link built here reads the same way the site's own buildSectionUrl
       writes it. */
    const place = textOf(floor).trim();
    if (place && isFloorAware(world, section)) query.floor = place;
    for (const [key, value] of Object.entries(params || {})) {
      const text = textOf(value).trim();
      if (text) query[key] = text;
    }
    return utils.resolveSafeInternalHref(utils.buildQueryUrl(path, query)) || null;
  }

  /* Which page shows one list record, and what that page needs in order to reveal it. The values come
     from the record's own fields, never from the visitor's wording. */
  function recordDestination(record) {
    const type = textOf(record && record.type);
    if (textOf(record && record.source) === "equipment" || type === "item") {
      return { section: "equipment", params: { category: textOf(record.category).trim() } };
    }
    if (type === "mob" || type === "boss") {
      const tab = textOf(record.bestiaryTab).trim();
      return tab ? { section: "bestiary", params: { category: tab } } : { section: "maps", params: {} };
    }
    if (type === "quest") return { section: "quests", params: { type: textOf(record.questType).trim() } };
    if (type === "npc" || type === "merchant" || type === "location" || type === "dungeon" || type === "area") {
      return { section: "maps", params: {} };
    }
    return null;
  }

  /* The section a result's own record can be opened in, or null when the site has no page for it. Only
     the record the engine resolved is used, never the visitor's own wording. */
  function linkSection(result) {
    const facts = result.facts || {};
    const intent = textOf(result.intent);
    const type = textOf(result.entityType);
    const world = textOf(result.context && result.context.world) || "aincrad";
    /* The Underworld publishes only its Compendium; its questline has no page of its own. */
    if (world === "underworld") {
      return intent === "item" && toArray(facts.compendium).length ? "compendium" : null;
    }
    if (intent === "collection" || intent === "ranking") return TARGET_SECTIONS[textOf(facts.target)] || null;
    if (intent === "location" || intent === "npc" || type === "dungeon") return "maps";
    /* A mob the Bestiary does not hold is known only from the spawn-area table, which is map data, so
       the map is the page that can actually show it. */
    if (intent === "mob" || intent === "mobDrops" || type === "mob" || type === "boss") {
      return hasBestiaryRecord(intent, facts) ? "bestiary" : "maps";
    }
    /* A drop or farming answer is about where an item comes from, and the Bestiary search matches drop
       names too, so that is the page that really shows it. */
    if (intent === "drop" || intent === "farming") return "bestiary";
    if (intent === "item" || intent === "recipe") {
      /* An item the equipment records do not hold is documented only by its Bestiary drop origins, so
         sending the visitor to the equipment list would land them on a page it is not on. */
      const onEquipmentPage = intent === "recipe" ? facts.recordPresent === true : Boolean(facts.record);
      if (!onEquipmentPage && toArray(facts.droppedBy).length) return "bestiary";
      return "equipment";
    }
    if (intent === "quest") return "quests";
    return null;
  }

  /* What a searchable section should be filtered to. It is the dataset's own title - never the
     visitor's question - so a question can never become part of a link. */
  function linkSearchTerm(result, section) {
    if (!SEARCHABLE_SECTIONS.has(section)) return "";
    const facts = result.facts || {};
    const intent = textOf(result.intent);
    if (intent === "drop" || intent === "farming") return textOf(facts.item).trim();
    if (intent === "collection" || intent === "ranking") return "";
    /* A mob the Bestiary does not hold is only on the map, and the map's search matches spawn-area
       titles rather than mob names - the mob itself is not a marker. The spawn area is used when the
       facts carry one; otherwise the section link stands alone instead of searching for a name the
       target page cannot match. */
    const isMob =
      intent === "mob" ||
      intent === "mobDrops" ||
      textOf(result.entityType) === "mob" ||
      textOf(result.entityType) === "boss";
    if (section === "maps" && isMob && !hasBestiaryRecord(intent, facts)) {
      const area = toArray(facts.spawnAreas)[0];
      return area ? textOf(area.area).trim() : "";
    }
    return textOf(result.entity && result.entity.name).trim();
  }

  /* The Quests page opens on a remembered tab, so a quest's own type travels with the link - the same
     parameter the map's own waypoint links carry (Aincrad/Map/maps.js getFloorSpecificQuestsUrl). */
  function linkQuestType(result, section) {
    if (section !== "quests") return "";
    const facts = result.facts || {};
    const fromFilter = textOf((facts.filters || {}).questType)
      .trim()
      .toLowerCase();
    if (fromFilter === "main" || fromFilter === "side") return fromFilter;
    const quest = toArray(facts.quests)[0];
    const fromQuest = textOf(quest && quest.questType)
      .trim()
      .toLowerCase();
    return fromQuest === "main" || fromQuest === "side" ? fromQuest : "";
  }

  function linkSectionLabel(section) {
    const key = LINK_LABEL_KEYS[section];
    if (!key) return "";
    return translate(key, LINK_LABEL_FALLBACKS[section] || section);
  }

  /* The destination for a result, or null when there is not a safe one. The path is the site's own route
     and the query is built once, so the floor and the search term cannot collide; the finished URL then
     goes through SAOPageUtils' resolver, which rejects anything that is not http(s) on this page's own
     origin. Without those helpers - the Tower Defense page loads none of them - no link is offered at
     all rather than an unvalidated one. */
  /* Every entity an answer names, paired with the destination that really shows it. A name is linked
     once, to the page holding its own record: an item to its equipment tab, a mob to the Bestiary list
     it is actually on, a marker to the map with its own category switched on. Nothing is guessed - the
     parameters come from the record, and a record without them simply sends none. */
  function entityLinks(result) {
    const facts = result.facts || {};
    const intent = textOf(result.intent);
    const world = textOf(result.context && result.context.world) || "aincrad";
    const floor = textOf(result.context && result.context.floor).trim();
    const links = [];
    const add = (name, destination, entityFloor) => {
      const text = textOf(name).trim();
      if (!text || !destination) return;
      if (links.some((entry) => entry.text === text)) return;
      const params = Object.assign({ search: text }, destination.params || {});
      const href = sectionHref(world, destination.section, params, entityFloor || floor);
      /* The section travels with the link: it is what the answer's own trailing section link is judged
         against, so that decision never has to read a URL or a record name. */
      if (href) links.push({ text, href, section: destination.section });
    };

    /* A list answer: every record opens its own result. */
    if (intent === "collection" || intent === "ranking") {
      for (const record of intent === "ranking" ? toArray(facts.ranked) : toArray(facts.records)) {
        add(record.name, recordDestination(record), record.floor);
      }
      return links;
    }

    /* A drop or farming answer: each source opens its own Bestiary entry, in the list it really is on,
       which is not necessarily the regular one. */
    if (intent === "drop" || intent === "farming") {
      for (const source of toArray(facts.droppedBy).concat(toArray(facts.sources))) {
        const tab = textOf(source.bestiaryTab).trim();
        add(source.mob, tab ? { section: "bestiary", params: { category: tab } } : null, source.floor);
      }
      return links;
    }

    /* A comparison: each record, on its own page. */
    if (intent === "comparison") {
      for (const entity of toArray(facts.entities)) add(entity.name, recordDestination(entity), entity.floor);
      return links;
    }

    /* One record: its own name, on the page that holds it. The destination is the same one the answer's
       own section link uses, so the two can never disagree. */
    const section = linkSection(result);
    if (!section) return links;
    /* An item the equipment records do not hold has nothing to open on the equipment page, so its name is
       not linked there - the answer's own section link already points at wherever it can really be seen. */
    if (section === "equipment" && !facts.record) return links;
    const name =
      entityName(result) || textOf(facts.name).trim() || textOf(facts.item).trim() || textOf(facts.mob).trim();
    if (!name) return links;
    const href = sectionHref(world, section, linkParams(result, section), floor);
    if (href) links.push({ text: name, href, section });
    return links;
  }

  /* Every parameter the answer's own destination needs: the record to filter to, the tab or map category
     that has to be open for that record to be visible, and the quest tab. Each value comes from the
     record itself, so a record without the field sends no parameter rather than a guess. */
  function linkParams(result, section) {
    const facts = result.facts || {};
    const params = {};
    const term = linkSearchTerm(result, section);
    if (term) params.search = term;
    const questType = linkQuestType(result, section);
    if (questType) params.type = questType;
    if (section === "equipment") {
      const category = textOf(facts.record && facts.record.category).trim();
      if (category) params.category = category;
    }
    if (section === "bestiary") {
      /* A boss is not in the regular list, so its tab has to travel with the link or the record stays
         hidden behind the wrong tab. */
      const tab = textOf((facts.bestiary && facts.bestiary.tab) || facts.bestiaryTab).trim();
      if (tab) params.category = tab;
    }
    if (section === "maps") {
      /* The map hides a marker whose own category is switched off, so a direct link switches that one
         category on - the marker's own, never a blanket set of them. Mob areas carry the map's own
         "mobAreas" category, which is how Aincrad/Map/maps.js renders them. */
      const marker = toArray(facts.markers)[0];
      const category = marker ? textOf(marker.category).trim() : "";
      if (category) params.categories = category;
      else if (toArray(facts.spawnAreas).length) params.categories = "mobAreas";
    }
    return params;
  }

  /* The answer's own trailing section link, or null when there is not a safe or a useful one.

     It is dropped when the answer already links records into that very section: those record links are
     the more specific navigation to the same page, so a second link to it is noise rather than a second
     route. That covers a single record whose own name is linked, a collection whose every item is linked,
     a drop or farming answer whose sources are each linked, and a map answer already pointed at the
     marker - including its own category and search.

     It is kept whenever nothing in the answer reached that section: a list whose records have no page of
     their own, a result with no name to link, a record the datasets do not hold. There it is the only way
     in. Two different records are never deduplicated against each other; only this one trailing link is
     judged, and only against the section it would repeat. */
  function linkFor(result, inlineLinks) {
    const section = linkSection(result);
    if (!section) return null;
    const alreadyReached = toArray(inlineLinks).some((entry) => textOf(entry && entry.section) === section);
    if (alreadyReached) return null;
    const world = textOf(result.context && result.context.world) || "aincrad";
    const floor = textOf(result.context && result.context.floor).trim();
    const href = sectionHref(world, section, linkParams(result, section), floor);
    if (!href) return null;
    const label = linkSectionLabel(section);
    if (!label) return null;
    return { href, label: `→ ${label}` };
  }

  function buildReply(result) {
    const status = textOf(result && result.status);
    if (status === "answer") return renderAnswer(result);
    if (status === "ambiguous") return renderAmbiguous(result);
    if (status === "missing") return renderMissing(result);
    return renderUnsupported(result);
  }

  /* Answers through the engine. When the cross-page data provider is still preparing its records the
     answer arrives as a promise, so the window never blocks and never shows a half-built reply. */
  function replyTo(question) {
    const engine = global.SAOArgoEngine;
    if (!engine || typeof engine.query !== "function")
      return { text: nextFromPool("status.engineMissing", STATUS_POOLS.engineMissing), link: null };
    const provider = global.SAOArgoData;
    if (provider && typeof provider.ensure === "function" && !provider.isReady()) {
      return Promise.resolve()
        .then(() => provider.ensure())
        .catch(() => null)
        .then(() => answerFromEngine(question));
    }
    return answerFromEngine(question);
  }

  /* The page's own dataset selection, read per question so changing the mode while the window is open
     is honoured. Argo never invents a dataset: without a hint the engine uses the site's own resolution,
     which is Beta by default and therefore reported as unsupported. */
  function datasetContext() {
    const provider = global.SAOArgoData;
    if (!provider || typeof provider.getDatasetHint !== "function") return null;
    try {
      const hint = provider.getDatasetHint();
      return hint === "current" || hint === "beta" ? { dataset: hint } : null;
    } catch (_error) {
      return null;
    }
  }

  /* The engine owns matching and facts; this only turns its result into words, and - when the site
     really publishes a page for the record - one link to it. */
  function answerFromEngine(question) {
    const context = datasetContext();
    let result = null;
    try {
      /* Without a dataset hint the engine resolves the context itself, so it is called with no second
         argument at all rather than with an empty one. */
      result = context ? global.SAOArgoEngine.query(question, context) : global.SAOArgoEngine.query(question);
    } catch (_error) {
      /* An engine failure is never allowed to leak into the conversation. */
      return { text: nextFromPool("status.error", STATUS_POOLS.error), link: null };
    }
    if (!result || typeof result !== "object") {
      return { text: nextFromPool("status.error", STATUS_POOLS.error), link: null };
    }
    const reply = buildReply(result);
    /* The record links are worked out first: whether the answer's own trailing section link adds anything
       depends on whether those already lead into the same section. */
    const links = entityLinks(result);
    const link = linkFor(result, links);
    /* The lines drawn for this answer are remembered once, here, rather than once per pool. */
    flushDialogueMemory();
    return { text: reply || nextFromPool("status.error", STATUS_POOLS.error), link, links };
  }

  /* Starts preparing the cross-page records as soon as the window opens, so the first question is
     normally instant. It never blocks the open and never throws into the page. */
  function prepareData() {
    const provider = global.SAOArgoData;
    if (!provider || typeof provider.ensure !== "function") return;
    try {
      const pending = provider.ensure();
      if (pending && typeof pending.catch === "function") pending.catch(() => null);
    } catch (_error) {
      /* The window still answers from whatever this page has loaded itself. */
    }
  }

  /* The window opens with a greeting rather than an answer; the greetings have their own pool. */
  function showIntro() {
    const key = chooseIntroKey();
    state.introKey = key;
    /* The greetings shown most recently are kept, so the next open - and the next visit - skips them. */
    const memory = readDialogueMemory();
    memory.intro = [key].concat(memory.intro.filter((entry) => entry !== key)).slice(0, INTRO_HISTORY_LIMIT);
    writeDialogueMemory();
    return appendMessage("argo", t(key));
  }

  /* Drawn at random from the greetings that are not still fresh, so the welcome is never a visible
     sequence: opening the window repeatedly, closing and reopening it, or reloading the page all skip
     the lines the visitor has already read. The whole pool is used before any line comes back, and the
     line shown last is excluded even when storage could not remember it. */
  function chooseIntroKey() {
    const recent = new Set(readDialogueMemory().intro);
    if (state.introKey) recent.add(state.introKey);
    const fresh = INTRO_KEYS.filter((key) => !recent.has(key));
    const pool = fresh.length ? fresh : INTRO_KEYS;
    return pool[Math.floor(randomUnit() * pool.length)];
  }

  /* Re-renders the current greeting in the new language without advancing the rotation. */
  function rerenderIntro() {
    const key = state.introKey || INTRO_KEYS[0];
    clearMessages();
    appendMessage("argo", t(key));
  }

  function handleSubmit(event) {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    const input = state.input;
    if (!input) return;
    const value = String(input.value || "").trim();
    /* Empty or whitespace-only input never reaches the engine. */
    if (!value) return;
    appendMessage("user", value);
    input.value = "";
    const answer = replyTo(value);
    if (answer && typeof answer.then === "function") {
      const conversation = state.conversationId;
      answer.then((reply) => {
        /* The window may have been closed or cleared while the records were still being prepared. */
        if (state.conversationId !== conversation) return;
        const text = reply && reply.text ? reply.text : nextFromPool("status.error", STATUS_POOLS.error);
        appendMessage("argo", text, reply && reply.link, reply && reply.links);
      });
      return;
    }
    appendMessage("argo", answer.text, answer.link, answer.links);
  }
  /* --- Position, dragging and keyboard movement ---------------------------- */

  const INTERACTIVE_SELECTOR = "button, input, textarea, select, a, [role='button']";

  function windowSize() {
    const rect = measure(state.windowEl);
    if (rect && rect.width > 0 && rect.height > 0) return rect;
    const viewport = getViewport();
    return {
      width: Math.min(360, viewport.width - 32),
      height: Math.min(420, viewport.height - 120)
    };
  }

  function applyPosition() {
    if (!state.windowEl || state.left === null || state.top === null) return;
    state.windowEl.style.left = `${Math.round(state.left)}px`;
    state.windowEl.style.top = `${Math.round(state.top)}px`;
  }

  /* Every position change goes through here, so the window can never be dragged off screen. */
  function setPosition(left, top) {
    const size = windowSize();
    const viewport = getViewport();
    state.left = clamp(left, VIEWPORT_MARGIN, viewport.width - size.width - VIEWPORT_MARGIN);
    state.top = clamp(top, VIEWPORT_MARGIN, viewport.height - size.height - VIEWPORT_MARGIN);
    applyPosition();
  }

  /* Opens just above the launcher so it reads as growing out of it; falls back to the bottom-left
     corner when the launcher has no measurable box. */
  function defaultPosition() {
    const size = windowSize();
    const viewport = getViewport();
    const launcherRect = measure(state.launcher);
    if (launcherRect && launcherRect.width > 0) {
      return {
        left: launcherRect.left,
        top: launcherRect.top - size.height - WINDOW_GAP
      };
    }
    return { left: 16, top: viewport.height - size.height - 16 };
  }

  /* Keeps a dragged window reachable after a viewport resize. */
  function reclampPosition() {
    if (!state.open || !state.windowEl) return;
    if (state.left === null || state.top === null) return;
    setPosition(state.left, state.top);
  }

  function isInteractiveTarget(target) {
    if (!target || typeof target.closest !== "function") return false;
    return Boolean(target.closest(INTERACTIVE_SELECTOR));
  }

  function onTitlebarPointerDown(event) {
    if (!state.open || !state.windowEl || !event) return;
    if (event.pointerType === "mouse" && typeof event.button === "number" && event.button !== 0) return;
    if (event.type === "mousedown" && typeof event.button === "number" && event.button !== 0) return;
    /* A press on the close button (or any other control) must never start a drag. */
    if (isInteractiveTarget(event.target)) return;

    const rect = measure(state.windowEl);
    const drag = {
      pointerId: event.pointerId === undefined || event.pointerId === null ? null : event.pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      originLeft: state.left === null ? (rect ? rect.left : 0) : state.left,
      originTop: state.top === null ? (rect ? rect.top : 0) : state.top,
      fallbackCleanups: []
    };
    state.drag = drag;

    const titlebar = state.titlebar;
    const canCapture = titlebar && typeof titlebar.setPointerCapture === "function" && drag.pointerId !== null;
    if (canCapture) {
      try {
        titlebar.setPointerCapture(drag.pointerId);
      } catch (_error) {
        /* Pointer capture is an optimisation; the drag still works without it. */
      }
    } else if (typeof global.addEventListener === "function") {
      /* Without capture the moves leave the title bar, so they are tracked on the window for the
         duration of this drag only - never a permanent global listener. */
      const addFallback = (type, handler) => {
        global.addEventListener(type, handler);
        drag.fallbackCleanups.push(() => global.removeEventListener?.(type, handler));
      };
      addFallback("pointermove", onTitlebarPointerMove);
      addFallback("pointerup", onTitlebarPointerEnd);
      addFallback("pointercancel", onTitlebarPointerEnd);
    }

    if (typeof event.preventDefault === "function") event.preventDefault();
  }

  function onTitlebarPointerMove(event) {
    const drag = state.drag;
    if (!drag || !event) return;
    const pointerId = event.pointerId === undefined || event.pointerId === null ? null : event.pointerId;
    if (drag.pointerId !== null && pointerId !== null && pointerId !== drag.pointerId) return;
    const deltaX = (Number(event.clientX) || 0) - drag.startX;
    const deltaY = (Number(event.clientY) || 0) - drag.startY;
    setPosition(drag.originLeft + deltaX, drag.originTop + deltaY);
  }

  function onTitlebarPointerEnd(event) {
    const drag = state.drag;
    if (!drag) return;
    const pointerId = event && event.pointerId !== undefined && event.pointerId !== null ? event.pointerId : null;
    if (drag.pointerId !== null && pointerId !== null && pointerId !== drag.pointerId) return;

    const titlebar = state.titlebar;
    if (titlebar && typeof titlebar.releasePointerCapture === "function" && drag.pointerId !== null) {
      try {
        titlebar.releasePointerCapture(drag.pointerId);
      } catch (_error) {
        /* Already released. */
      }
    }
    (drag.fallbackCleanups || []).forEach((cleanup) => cleanup());
    state.drag = null;
  }

  function onTitlebarKeydown(event) {
    if (!event || !state.open) return;
    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP;
    let deltaX = 0;
    let deltaY = 0;
    if (event.key === "ArrowLeft") deltaX = -step;
    else if (event.key === "ArrowRight") deltaX = step;
    else if (event.key === "ArrowUp") deltaY = -step;
    else if (event.key === "ArrowDown") deltaY = step;
    else return;

    const rect = measure(state.windowEl);
    const originLeft = state.left === null ? (rect ? rect.left : 0) : state.left;
    const originTop = state.top === null ? (rect ? rect.top : 0) : state.top;
    setPosition(originLeft + deltaX, originTop + deltaY);
    if (typeof event.preventDefault === "function") event.preventDefault();
  }
  /* --- Open, close and the closing sphere ---------------------------------- */

  function setLauncherExpanded(expanded) {
    if (state.launcher && typeof state.launcher.setAttribute === "function") {
      state.launcher.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
  }

  function showLauncher() {
    state.launcher?.classList?.remove?.("is-hidden");
  }

  function hideLauncher() {
    state.launcher?.classList?.add?.("is-hidden");
  }

  function focusElement(element) {
    if (!element || typeof element.focus !== "function") return;
    try {
      element.focus();
    } catch (_error) {
      /* Focus can be refused (hidden document); never fatal. */
    }
  }

  function open() {
    if (!state.windowEl || !state.input) return false;
    /* A rapid re-open during the closing animation finishes that close first, so two animations can
       never fight over the same elements. */
    if (state.closing) finishClose();
    if (state.open) return true;

    state.open = true;
    state.windowEl.hidden = false;
    state.windowEl.classList?.add?.("is-measuring");
    if (state.left === null || state.top === null) {
      const start = defaultPosition();
      state.left = start.left;
      state.top = start.top;
    }
    /* Positioned with the real box before it is revealed. */
    setPosition(state.left, state.top);
    state.windowEl.classList?.remove?.("is-measuring");

    const reveal = () => state.windowEl?.classList?.add?.("is-open");
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(reveal);
    else reveal();

    hideLauncher();
    setLauncherExpanded(true);
    showIntro();
    prepareData();
    focusElement(state.input);
    return true;
  }

  function close() {
    if (!state.windowEl || !state.open || state.closing) return false;
    state.closing = true;

    /* Read the live boxes: the window may have been dragged anywhere on screen. */
    const windowRect = measure(state.windowEl);
    const launcherRect = measure(state.launcher);
    /* The launcher becomes visible again straight away so the sphere has a real target. */
    showLauncher();
    setLauncherExpanded(false);

    if (prefersReducedMotion() || !windowRect || !launcherRect || launcherRect.width === 0) {
      finishClose();
      return true;
    }

    spawnSphere(windowRect, launcherRect);
    return true;
  }

  function toggle() {
    if (state.open) close();
    else open();
    return state.open;
  }

  function spawnSphere(windowRect, launcherRect) {
    const doc = getDocument();
    const sphere = doc && doc.body ? createElement("div", SPHERE_CLASS) : null;
    if (!sphere) {
      finishClose();
      return;
    }

    const fromX = windowRect.left + windowRect.width / 2 - SPHERE_SIZE / 2;
    const fromY = windowRect.top + windowRect.height / 2 - SPHERE_SIZE / 2;
    const toX = launcherRect.left + launcherRect.width / 2 - SPHERE_SIZE / 2;
    const toY = launcherRect.top + launcherRect.height / 2 - SPHERE_SIZE / 2;

    sphere.style.transform = `translate(${fromX}px, ${fromY}px) scale(1)`;
    sphere.style.opacity = "1";
    doc.body.appendChild(sphere);
    state.sphere = sphere;

    /* Safety net: whatever happens to the animation (missing API, interrupted, hidden tab) the
       close still completes and nothing is left on screen. */
    state.closeTimer = global.setTimeout(finishClose, CLOSE_SAFETY_MS);

    const settle = () => finishClose();
    if (typeof sphere.animate === "function") {
      let animation = null;
      try {
        animation = sphere.animate(
          [
            {
              transform: `translate(${fromX}px, ${fromY}px) scale(1)`,
              opacity: 1
            },
            {
              transform: `translate(${toX}px, ${toY}px) scale(0.6)`,
              opacity: 0.2
            }
          ],
          {
            duration: CLOSE_TRAVEL_MS,
            easing: "cubic-bezier(0.4, 0, 0.6, 1)",
            fill: "forwards"
          }
        );
      } catch (_error) {
        animation = null;
      }
      if (animation && animation.finished && typeof animation.finished.then === "function") {
        /* A rejected promise (cancelled animation) must not leave the UI stuck. */
        animation.finished.then(settle, settle);
        return;
      }
      global.setTimeout(settle, CLOSE_TRAVEL_MS);
      return;
    }

    /* Fallback for browsers without the Web Animations API: the same travel through a transition. */
    sphere.style.transition = `transform ${CLOSE_TRAVEL_MS}ms ease-in, opacity ${CLOSE_TRAVEL_MS}ms ease-in`;
    const step = () => {
      sphere.style.transform = `translate(${toX}px, ${toY}px) scale(0.6)`;
      sphere.style.opacity = "0.2";
    };
    if (typeof global.requestAnimationFrame === "function") global.requestAnimationFrame(step);
    else step();
    global.setTimeout(settle, CLOSE_TRAVEL_MS + 30);
  }

  function removeSphere() {
    const sphere = state.sphere;
    state.sphere = null;
    if (!sphere) return;
    if (typeof sphere.remove === "function") {
      sphere.remove();
      return;
    }
    const parent = sphere.parentNode;
    if (parent && typeof parent.removeChild === "function") parent.removeChild(sphere);
  }

  /* Idempotent: whichever path reports first wins, and the safety timer can never double-run it. */
  function finishClose() {
    if (!state.closing) return;
    state.closing = false;
    state.open = false;
    if (state.closeTimer !== null) {
      global.clearTimeout?.(state.closeTimer);
      state.closeTimer = null;
    }
    removeSphere();
    /* The conversation is dropped here, so reopening always starts fresh and nothing lingers. */
    clearConversation();
    if (state.windowEl) {
      state.windowEl.classList?.remove?.("is-open");
      state.windowEl.hidden = true;
    }
    state.drag = null;
    showLauncher();
    setLauncherExpanded(false);
    focusElement(state.launcher);
  }
  /* --- Lifecycle ----------------------------------------------------------- */

  /* Both ensure* functions adopt an existing element before building one, so running init() twice
     (or a second copy of this script) can never add a duplicate launcher or window. */
  function ensureLauncher() {
    if (state.launcher) return state.launcher;
    const doc = getDocument();
    if (!doc || !doc.body) return null;
    const existing = typeof doc.getElementById === "function" ? doc.getElementById(LAUNCHER_ID) : null;
    state.launcher = existing || buildLauncher();
    return state.launcher;
  }

  function ensureWindow() {
    if (state.windowEl) return state.windowEl;
    const doc = getDocument();
    if (!doc || !doc.body) return null;
    const existing = typeof doc.getElementById === "function" ? doc.getElementById(WINDOW_ID) : null;
    if (existing) {
      state.windowEl = existing;
      state.titlebar = existing.querySelector?.(".argo-titlebar") || null;
      state.log = existing.querySelector?.(".argo-log") || null;
      state.form = existing.querySelector?.(".argo-form") || null;
      state.input = existing.querySelector?.(".argo-input") || null;
      state.closeButton = existing.querySelector?.(".argo-close") || null;
      return existing;
    }
    const built = buildWindow();
    if (!built) return null;
    state.windowEl = built.container;
    state.titlebar = built.titlebar;
    state.log = built.log;
    state.form = built.form;
    state.input = built.input;
    state.closeButton = built.closeButton;
    return state.windowEl;
  }

  /* The elements are built after the page's own applyTranslations() pass has already run, so the
     window subtree gets one explicit pass here. The launcher's own labels were set through
     translate() at build time and are refreshed by the page's document-wide pass on language
     change. */
  function applyTranslations() {
    const i18n = global.SAOI18n;
    if (!i18n || typeof i18n.applyTranslations !== "function" || !state.windowEl) return;
    try {
      i18n.applyTranslations(state.windowEl);
    } catch (_error) {
      /* The English fallbacks stay in place. */
    }
  }

  function onLanguageChange() {
    applyTranslations();
    if (!state.open) return;
    /* The greeting is the only message this module owns, so it is re-rendered in the new language
       instead of translating an already-rendered answer. */
    const hasUserMessage = state.messages.some((node) => node.classList?.contains?.("is-user"));
    if (hasUserMessage) return;
    rerenderIntro();
  }

  function onDocumentKeydown(event) {
    if (!event || event.key !== "Escape" || !state.open) return;
    if (typeof event.preventDefault === "function") event.preventDefault();
    close();
  }

  function init() {
    const doc = getDocument();
    if (!doc || !doc.body) return null;
    if (!state.initialized) {
      state.initialized = true;
      state.document = doc;
      listen(doc, "keydown", onDocumentKeydown);
      listen(doc, "sao:languagechange", onLanguageChange);
      listen(global, "resize", reclampPosition);
    }
    ensureLauncher();
    ensureWindow();
    applyTranslations();
    return api;
  }

  function destroy() {
    state.cleanups.forEach((cleanup) => cleanup());
    state.cleanups = [];
    if (state.closeTimer !== null) {
      global.clearTimeout?.(state.closeTimer);
      state.closeTimer = null;
    }
    removeSphere();
    clearMessages();
    const removeElement = (element) => {
      if (!element) return;
      if (typeof element.remove === "function") {
        element.remove();
        return;
      }
      const parent = element.parentNode;
      if (parent && typeof parent.removeChild === "function") parent.removeChild(element);
    };
    removeElement(state.windowEl);
    removeElement(state.launcher);
    state.windowEl = null;
    state.launcher = null;
    state.titlebar = null;
    state.log = null;
    state.form = null;
    state.input = null;
    state.closeButton = null;
    state.open = false;
    state.closing = false;
    state.left = null;
    state.top = null;
    state.drag = null;
    state.introKey = null;
    state.poolBags = {};
    state.dialogueMemory = null;
    state.dialogueDirty = false;
    state.conversationId += 1;
    state.initialized = false;
  }

  const api = Object.freeze({
    launcherId: LAUNCHER_ID,
    windowId: WINDOW_ID,
    init,
    ensureLauncher,
    ensureWindow,
    open,
    close,
    toggle,
    isOpen: () => state.open,
    isClosing: () => state.closing,
    /* Wording and layout are drawn at random; a test can install its own source so the variety checks
       are repeatable. Passing anything that is not a function restores Math.random. */
    setRandomSource(source) {
      state.randomSource = typeof source === "function" ? source : null;
      return api;
    },
    destroy
  });

  global.SAOArgo = api;

  /* Self-initialize like the other shared modules (sao-polish.js, sao-i18n.js). */
  function autoInit() {
    try {
      init();
    } catch (_error) {
      /* The launcher must never be able to break a page. */
    }
  }

  const readyDocument = global.document;
  if (readyDocument && readyDocument.readyState === "loading") {
    readyDocument.addEventListener("DOMContentLoaded", autoInit, {
      once: true
    });
  } else {
    autoInit();
  }
})(typeof window !== "undefined" ? window : globalThis);
