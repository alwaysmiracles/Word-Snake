// Word definitions for all words in the word pool
// Used for tooltip display in the game sidebar and poem page

import type { WordCategory } from './word-pool'

export interface WordDefinition {
  word: string
  definition: string
  example: string
  category: WordCategory
  etymology: string
}

const DEFINITIONS: WordDefinition[] = [
  // Nature
  { word: 'river', definition: 'A large natural stream of flowing water that moves toward the sea, a lake, or another river.', example: 'The river wound lazily through the green valley.', category: 'nature', etymology: "From Latin 'ripa' (riverbank)" },
  { word: 'ocean', definition: 'A vast body of saltwater that covers most of the Earth\'s surface.', example: 'Whales migrate across the entire ocean each year.', category: 'nature', etymology: "From Greek 'Okeanos' (great river)" },
  { word: 'forest', definition: 'A large area densely covered with trees and undergrowth.', example: 'Sunlight filtered softly through the ancient forest canopy.', category: 'nature', etymology: "From Latin 'forestis' (outside woods)" },
  { word: 'mountain', definition: 'A large natural elevation of the earth\'s surface rising steeply above its surroundings.', example: 'Snow capped the mountain peaks even in summer.', category: 'nature', etymology: "From Latin 'montanus' (mountainous)" },
  { word: 'flower', definition: 'The colorful, seed-bearing part of a plant, often fragrant and beautiful.', example: 'A single flower pushed through the crack in the pavement.', category: 'nature', etymology: "From Latin 'flos' (bloom)" },
  { word: 'breeze', definition: 'A gentle, pleasant wind.', example: 'A cool breeze rustled the autumn leaves.', category: 'nature', etymology: "From Spanish 'briza' (northeast wind)" },
  { word: 'sunset', definition: 'The daily event when the sun disappears below the western horizon, often producing vivid colors.', example: 'They watched the sunset paint the sky in shades of gold.', category: 'nature', etymology: "Compound of sun + set, OE origins" },
  { word: 'rainbow', definition: 'An arc of spectral colors appearing in the sky opposite the sun after rain.', example: 'A brilliant rainbow stretched across the valley after the storm.', category: 'nature', etymology: "Compound of rain + bow, OE origins" },
  { word: 'thunder', definition: 'The loud rumbling or crashing sound heard after a flash of lightning.', example: 'Thunder rolled across the hills, shaking the windows.', category: 'nature', etymology: "From Old English 'þunor'" },
  { word: 'meadow', definition: 'A piece of grassland, especially near a river, often filled with wildflowers.', example: 'Butterflies danced above the wildflowers in the meadow.', category: 'nature', etymology: "From Old English 'mǣd' (meadow)" },
  { word: 'valley', definition: 'A low area of land between hills or mountains, often with a river flowing through it.', example: 'The village nestled quietly in the sheltered valley.', category: 'nature', etymology: "From Latin 'vallis' (valley)" },
  { word: 'island', definition: 'A piece of land completely surrounded by water.', example: 'The tiny island was home to a single lighthouse.', category: 'nature', etymology: "From Old English 'īeg' + 'land'" },
  { word: 'desert', definition: 'A barren area of land with little precipitation, often covered in sand.', example: 'The desert stretched endlessly under the blazing sun.', category: 'nature', etymology: "From Latin 'desertus' (abandoned)" },
  { word: 'glacier', definition: 'A massive, slow-moving body of compacted ice formed over centuries.', example: 'The glacier had been retreating for decades, leaving carved rock behind.', category: 'nature', etymology: "From French 'glace' (ice)" },
  { word: 'aurora', definition: 'A natural light display in the sky, especially in polar regions, caused by charged solar particles.', example: 'The aurora danced in green and violet ribbons across the Arctic sky.', category: 'nature', etymology: "From Latin 'aurora' (dawn)" },
  { word: 'storm', definition: 'A violent disturbance of the atmosphere with strong winds, rain, thunder, or snow.', example: 'The storm arrived suddenly, lashing the coast with fierce winds.', category: 'nature', etymology: "From Old English 'storm'" },
  { word: 'canyon', definition: 'A deep, narrow valley with steep sides, often carved by a river over millions of years.', example: 'The canyon walls glowed red and orange in the late afternoon sun.', category: 'nature', etymology: "From Spanish 'cañón' (tube, pipe)" },
  { word: 'reef', definition: 'A ridge of rock, coral, or sand at or near the surface of the water.', example: 'Colorful fish darted among the coral formations of the reef.', category: 'nature', etymology: "From Old Norse 'rif' (rib)" },
  { word: 'volcano', definition: 'An opening in the earth\'s crust through which lava, ash, and gases erupt.', example: 'The volcano rumbled ominously, sending plumes of smoke into the sky.', category: 'nature', etymology: "From Latin 'Vulcanus' (god of fire)" },
  { word: 'prairie', definition: 'A large, open area of grassland, especially in North America.', example: 'Wildflowers blanketed the prairie as far as the eye could see.', category: 'nature', etymology: "From French 'prairie' (meadow)" },
  { word: 'tundra', definition: 'A vast, flat, treeless arctic region with permanently frozen subsoil.', example: 'Only the hardiest plants can survive on the frozen tundra.', category: 'nature', etymology: "From Russian 'tundra' (treeless plain)" },
  { word: 'oasis', definition: 'A fertile spot in a desert, sustained by a spring or well.', example: 'After days of travel, the oasis appeared like a mirage made real.', category: 'nature', etymology: "From Late Latin 'oasis' (Egyptian)" },
  { word: 'waterfall', definition: 'A cascade of water falling from a height, formed when a river flows over a steep drop.', example: 'The waterfall roared with a thunderous sound that echoed through the gorge.', category: 'nature', etymology: "Compound of water + fall, OE origins" },
  { word: 'horizon', definition: 'The line at which the earth\'s surface and the sky appear to meet.', example: 'They watched the sun sink slowly below the distant horizon.', category: 'nature', etymology: "From Greek 'horizōn' (bounding)" },

  // Emotions
  { word: 'joy', definition: 'A feeling of great pleasure and happiness.', example: 'Joy filled her heart when she saw her family again.', category: 'emotion', etymology: "From Latin 'gaudia' (delight)" },
  { word: 'hope', definition: 'A feeling of expectation and desire for a positive outcome.', example: 'Hope kept them going through the darkest of times.', category: 'emotion', etymology: "From Old English 'hopian'" },
  { word: 'peace', definition: 'Freedom from disturbance; a state of calm and tranquility.', example: 'She found peace sitting by the quiet mountain lake.', category: 'emotion', etymology: "From Latin 'pax' (peace)" },
  { word: 'dream', definition: 'A series of thoughts, images, or sensations occurring during sleep, or a cherished aspiration.', example: 'He held onto his dream of becoming a great storyteller.', category: 'emotion', etymology: "From Old English 'drēam' (joy, music)" },
  { word: 'wonder', definition: 'A feeling of amazement caused by something beautiful, unexpected, or inexplicable.', example: 'The child stared in wonder at the starry night sky.', category: 'emotion', etymology: "From Old English 'wundor'" },
  { word: 'courage', definition: 'The ability to face danger, difficulty, or pain without being overcome by fear.', example: 'It took courage to stand up and speak the truth.', category: 'emotion', etymology: "From French 'corage' (heart)" },
  { word: 'bliss', definition: 'Supreme happiness; utter joy or contentment.', example: 'Lazing in the warm sun by the sea was pure bliss.', category: 'emotion', etymology: "From Old English 'blīths' (gentle)" },
  { word: 'calm', definition: 'A state of peacefulness and absence of agitation or strong emotion.', example: 'The calm water of the lake reflected the mountains perfectly.', category: 'emotion', etymology: "From Greek 'kauma' (heat)" },
  { word: 'fury', definition: 'Wild or violent anger; intense destructive energy.', example: 'The fury of the storm left broken branches across the road.', category: 'emotion', etymology: "From Latin 'furor' (frenzy)" },
  { word: 'grace', definition: 'Simple elegance or refinement of movement; a courteous goodwill.', example: 'She moved with the grace of a dancer across the stage.', category: 'emotion', etymology: "From Latin 'gratia' (favor)" },
  { word: 'pride', definition: 'A feeling of deep pleasure or satisfaction derived from achievements or qualities.', example: 'He swelled with pride as he watched his daughter graduate.', category: 'emotion', etymology: "From Old English 'prȳda'" },
  { word: 'faith', definition: 'Complete trust or confidence in someone or something.', example: 'Her faith in the kindness of strangers was never misplaced.', category: 'emotion', etymology: "From Latin 'fides' (trust)" },
  { word: 'love', definition: 'An intense feeling of deep affection, attachment, or devotion.', example: 'Love is the thread that holds the world together.', category: 'emotion', etymology: "From Old English 'lufu'" },
  { word: 'zeal', definition: 'Great energy or enthusiasm in pursuit of a cause or objective.', example: 'She pursued her art with the zeal of a true believer.', category: 'emotion', etymology: "From Greek 'zēlos' (jealousy)" },
  { word: 'mirth', definition: 'Amusement, especially as expressed in laughter and merriment.', example: 'The room erupted in mirth at the comedian\'s clever joke.', category: 'emotion', etymology: "From Old English 'myrth' (joy)" },
  { word: 'dread', definition: 'A strong feeling of fear or apprehension about something that may happen.', example: 'A sense of dread crept over him as the shadows lengthened.', category: 'emotion', etymology: "From Old English 'drǣdan' (to fear)" },
  { word: 'nostalgia', definition: 'A sentimental longing or wistful affection for the past.', example: 'The old photograph filled her with nostalgia for childhood summers.', category: 'emotion', etymology: "From Greek 'nostos' + 'algos' (return + pain)" },
  { word: 'ecstasy', definition: 'An overwhelming feeling of great happiness or joyful excitement.', example: 'The news of their victory sent the crowd into pure ecstasy.', category: 'emotion', etymology: "From Greek 'ekstasis' (standing outside oneself)" },
  { word: 'sorrow', definition: 'A feeling of deep distress caused by loss, disappointment, or suffering.', example: 'She spoke quietly, her voice heavy with sorrow.', category: 'emotion', etymology: "From Old English 'sārig' (troubled)" },
  { word: 'envy', definition: 'A feeling of discontented longing aroused by someone else\'s possessions or qualities.', example: 'He could not hide his envy at their carefree happiness.', category: 'emotion', etymology: "From Latin 'invidia' (looking against)" },
  { word: 'anguish', definition: 'Severe mental or physical pain or suffering.', example: 'She cried out in anguish when she heard the terrible news.', category: 'emotion', etymology: "From Latin 'angustia' (narrowness)" },
  { word: 'resolve', definition: 'Firm determination to do something; to decide firmly on a course of action.', example: 'She met every setback with quiet resolve and kept moving forward.', category: 'emotion', etymology: "From Latin 'resolvere' (to unfasten)" },

  // Elements
  { word: 'fire', definition: 'Combustion that produces light, heat, and flame; a powerful elemental force.', example: 'The campfire crackled and sent sparks into the night sky.', category: 'element', etymology: "From Old English 'fȳr'" },
  { word: 'water', definition: 'The transparent, colorless, odorless liquid essential for all life.', example: 'Clear water tumbled over the mossy rocks of the stream.', category: 'element', etymology: "From Old English 'wæter'" },
  { word: 'earth', definition: 'The solid ground beneath our feet; soil or land; the planet we inhabit.', example: 'The farmer knelt and let the rich earth run through his fingers.', category: 'element', etymology: "From Old English 'eorþe' (ground)" },
  { word: 'wind', definition: 'The natural movement of air, ranging from a gentle breeze to a powerful gale.', example: 'The wind carried the scent of wildflowers across the field.', category: 'element', etymology: "From Old English 'wind'" },
  { word: 'light', definition: 'The natural agent that makes things visible; electromagnetic radiation.', example: 'A single shaft of light broke through the heavy clouds.', category: 'element', etymology: "From Old English 'lēoht'" },
  { word: 'shadow', definition: 'A dark area produced by an object blocking the passage of light.', example: 'Long shadows stretched across the lawn as evening fell.', category: 'element', etymology: "From Old English 'sceadu'" },
  { word: 'frost', definition: 'A thin deposit of ice crystals formed on surfaces when the temperature drops below freezing.', example: 'Morning frost glittered on every blade of grass.', category: 'element', etymology: "From Old English 'frost'" },
  { word: 'flame', definition: 'A hot glowing body of ignited gas produced by combustion.', example: 'The candle\'s flame flickered in the drafty room.', category: 'element', etymology: "From Latin 'flamma'" },
  { word: 'spark', definition: 'A small fiery particle thrown off from a fire or produced by striking together two hard surfaces.', example: 'A single spark was enough to ignite the dry kindling.', category: 'element', etymology: "From Old English 'spearca'" },
  { word: 'stone', definition: 'A hard solid piece of mineral matter; a rock.', example: 'The ancient stone wall had stood for hundreds of years.', category: 'element', etymology: "From Old English 'stān'" },
  { word: 'crystal', definition: 'A solid with atoms arranged in a highly ordered structure, often forming beautiful geometric shapes.', example: 'The crystal caught the light and scattered rainbows across the room.', category: 'element', etymology: "From Greek 'krystallos' (ice)" },
  { word: 'ember', definition: 'A small piece of burning or glowing coal or wood in a dying fire.', example: 'The embers glowed warmly long after the flames had died.', category: 'element', etymology: "From Old English 'ǣmyrge'" },
  { word: 'smoke', definition: 'A visible suspension of carbon particles in air, typically emitted from burning material.', example: 'Smoke curled lazily from the chimney into the frosty air.', category: 'element', etymology: "From Old English 'smoca'" },
  { word: 'cloud', definition: 'A visible mass of condensed water vapor floating in the atmosphere.', example: 'A single white cloud drifted across the otherwise blue sky.', category: 'element', etymology: "From Old English 'clūd' (mass)" },
  { word: 'tide', definition: 'The alternate rising and falling of the sea, caused by the gravitational pull of the moon and sun.', example: 'The tide had gone out, leaving tide pools along the shore.', category: 'element', etymology: "From Old English 'tīd' (time)" },
  { word: 'dew', definition: 'Tiny drops of water that form on cool surfaces overnight through condensation.', example: 'Morning dew clung to every spider web in the garden.', category: 'element', etymology: "From Old English 'dēaw'" },
  { word: 'mist', definition: 'A thin, diffused fog or vapor suspended in the air, reducing visibility.', example: 'The hills were shrouded in an ethereal morning mist.', category: 'element', etymology: "From Middle English 'mist' (darkness)" },
  { word: 'quartz', definition: 'A hard, crystalline mineral composed of silicon and oxygen, often found in rocks.', example: 'A vein of pure quartz ran through the cliff face, glittering in the sun.', category: 'element', etymology: "From German 'Quarz' (hard)" },
  { word: 'monsoon', definition: 'A seasonal prevailing wind bringing heavy rainfall, especially in South Asia.', example: 'The monsoon transformed the parched land into a lush green landscape.', category: 'element', etymology: "From Arabic 'mausim' (season)" },
  { word: 'eclipse', definition: 'An obscuring of one celestial body by another, or a loss of significance in comparison.', example: 'The solar eclipse drew scientists and spectators from around the world.', category: 'element', etymology: "From Greek 'ekleipsis' (abandonment)" },
  { word: 'solstice', definition: 'Either of the two times each year when the sun reaches its highest or lowest point in the sky.', example: 'They gathered at Stonehenge to celebrate the summer solstice.', category: 'element', etymology: "From Latin 'solstitium' (sun standing still)" },

  // Time
  { word: 'dawn', definition: 'The first appearance of light in the sky before sunrise; the beginning of the day.', example: 'They rose at dawn to begin the long journey ahead.', category: 'time', etymology: "From Old English 'dagung' (daybreak)" },
  { word: 'dusk', definition: 'The darker part of twilight, just before night falls completely.', example: 'Fireflies began to appear at dusk along the riverbank.', category: 'time', etymology: "From Old English 'dox' (dark)" },
  { word: 'twilight', definition: 'The soft, diffused light that occurs between sunset and full night, or just before sunrise.', example: 'The world seemed to hold its breath in the quiet twilight.', category: 'time', etymology: "From OE 'twi-' + 'lēoht' (two lights)" },
  { word: 'eternity', definition: 'Infinite or unending time; a state of existence beyond temporal limits.', example: 'In that frozen moment, it felt as though eternity had paused.', category: 'time', etymology: "From Latin 'aeternitas'" },
  { word: 'moment', definition: 'A very brief period of time; an instant.', example: 'In a single moment, everything changed forever.', category: 'time', etymology: "From Latin 'momentum' (movement)" },
  { word: 'season', definition: 'One of the four divisions of the year marked by particular weather patterns and daylight hours.', example: 'Each season brings its own beauty and challenges.', category: 'time', etymology: "From Latin 'satio' (sowing)" },
  { word: 'epoch', definition: 'A particular period of time in history or a person\'s life, typically one marked by notable events.', example: 'The invention of the printing press marked a new epoch in human knowledge.', category: 'time', etymology: "From Greek 'epochē' (pause)" },
  { word: 'hour', definition: 'A period of time equal to sixty minutes; a specific point in time.', example: 'They spent one happy hour simply watching the river flow.', category: 'time', etymology: "From Greek 'hōra' (season)" },
  { word: 'heartbeat', definition: 'A single pulsation of the heart; the rhythm of life itself.', example: 'She held her breath, feeling every heartbeat in the silence.', category: 'time', etymology: "Compound of heart + beat, OE origins" },
  { word: 'millennium', definition: 'A period of one thousand years; a long-awaited golden age.', example: 'The ancient temple had stood for nearly a millennium.', category: 'time', etymology: "From Latin 'mille' + 'annus' (thousand years)" },
  { word: 'aftermath', definition: 'The consequences or aftereffects of a significant, often unpleasant, event.', example: 'In the aftermath of the storm, the community came together to rebuild.', category: 'time', etymology: "From Old English 'æfter' + 'mæþ' (after + mowing)" },
  { word: 'interlude', definition: 'A pause or break between periods of activity; a short intervening episode.', example: 'The quiet interlude between storms was brief but peaceful.', category: 'time', etymology: "From Latin 'interlusio' (between play)" },
  { word: 'genesis', definition: 'The origin or mode of formation of something; a beginning or coming into being.', example: 'The genesis of their friendship was a shared love of music.', category: 'time', etymology: "From Greek 'genesis' (origin)" },

  // Creatures
  { word: 'eagle', definition: 'A large bird of prey with keen eyesight and powerful talons, known for its majestic flight.', example: 'The eagle soared high above the mountain ridge.', category: 'creature', etymology: "From Latin 'aquila'" },
  { word: 'wolf', definition: 'A wild carnivorous mammal related to dogs, known for living and hunting in packs.', example: 'The howl of a lone wolf echoed across the frozen tundra.', category: 'creature', etymology: "From Old English 'wulf'" },
  { word: 'dolphin', definition: 'An intelligent, social marine mammal known for its playful nature and streamlined body.', example: 'A pod of dolphins leaped gracefully through the waves.', category: 'creature', etymology: "From Greek 'delphis'" },
  { word: 'phoenix', definition: 'A mythical bird that cyclically regenerates, burning itself on a pyre and rising anew from the ashes.', example: 'Like a phoenix, she rebuilt her life from the ruins of the old.', category: 'creature', etymology: "From Greek 'phoinix' (dark red)" },
  { word: 'dragon', definition: 'A legendary serpentine creature often depicted with wings, claws, and the ability to breathe fire.', example: 'Ancient legends spoke of a dragon guarding the mountain treasure.', category: 'creature', etymology: "From Greek 'drakōn' (serpent)" },
  { word: 'falcon', definition: 'A bird of prey known for its incredible speed and precision in hunting, especially during a dive.', example: 'The falcon dove at breathtaking speed toward its target.', category: 'creature', etymology: "From Latin 'falco'" },
  { word: 'tiger', definition: 'A large solitary cat with a distinctive orange and black striped coat, native to Asia.', example: 'The tiger moved silently through the tall jungle grass.', category: 'creature', etymology: "From Persian 'tigra' (sharp)" },
  { word: 'swan', definition: 'A large, elegant waterbird with a long slender neck, known for its graceful appearance.', example: 'The white swan glided serenely across the moonlit lake.', category: 'creature', etymology: "From Old English 'swan' (singer)" },
  { word: 'panther', definition: 'A large, powerful wild cat with a dark coat, known for stealth and strength.', example: 'The panther melted into the shadows without a sound.', category: 'creature', etymology: "From Greek 'panther' (all-beast)" },
  { word: 'raven', definition: 'A large, glossy black bird of the crow family, known for its intelligence and deep calls.', example: 'A lone raven perched on the old fence post, watching silently.', category: 'creature', etymology: "From Old English 'hræfn'" },
  { word: 'cobra', definition: 'A venomous snake that spreads a hood around its head when threatened.', example: 'The cobra rose from the tall grass, its hood flared wide.', category: 'creature', etymology: "From Portuguese 'cobra' (snake)" },
  { word: 'mantis', definition: 'A predatory insect with large powerful front legs used for grasping prey.', example: 'The praying mantis remained perfectly still, waiting to strike.', category: 'creature', etymology: "From Greek 'mantis' (prophet)" },
  { word: 'whale', definition: 'The largest living mammals, marine creatures known for their immense size and deep ocean songs.', example: 'A blue whale breached the surface, sending spray high into the air.', category: 'creature', etymology: "From Old English 'hwæl'" },

  // Qualities
  { word: 'wisdom', definition: 'The quality of having experience, knowledge, and good judgment.', example: 'With age came the wisdom to see beyond appearances.', category: 'quality', etymology: "From Old English 'wīsdōm'" },
  { word: 'beauty', definition: 'A combination of qualities that pleases the aesthetic senses or the mind.', example: 'The beauty of the landscape left every traveler speechless.', category: 'quality', etymology: "From Latin 'bellus' (pretty)" },
  { word: 'strength', definition: 'The quality or state of being physically strong; the capacity to withstand great force or pressure.', example: 'Her inner strength carried her through the most difficult times.', category: 'quality', etymology: "From Old English 'strengþu'" },
  { word: 'freedom', definition: 'The state of being free or at liberty, not imprisoned or enslaved.', example: 'They cherished the freedom to chart their own course.', category: 'quality', etymology: "From Old English 'freodom'" },
  { word: 'magic', definition: 'The power of apparently influencing events by using mysterious or supernatural forces.', example: 'The forest seemed alive with an ancient, quiet magic.', category: 'quality', etymology: "From Greek 'magikos' (sorcerer)" },
  { word: 'power', definition: 'The ability or capacity to do something or act in a particular way; strength or influence.', example: 'Knowledge is a power that no one can take away.', category: 'quality', etymology: "From Latin 'potere' (to be able)" },
  { word: 'honor', definition: 'High respect; great esteem; adherence to what is right or to a strict standard of conduct.', example: 'He defended his honor with quiet dignity and resolve.', category: 'quality', etymology: "From Latin 'honos' (esteem)" },
  { word: 'truth', definition: 'That which is true or in accordance with fact or reality.', example: 'The truth, however uncomfortable, is always worth seeking.', category: 'quality', etymology: "From Old English 'trēowth'" },
  { word: 'resilience', definition: 'The capacity to recover quickly from difficulties; toughness and adaptability.', example: 'Her resilience in the face of adversity inspired everyone around her.', category: 'quality', etymology: "From Latin 'resilire' (to leap back)" },
  { word: 'harmony', definition: 'A state of peaceful existence and agreement; pleasing arrangement of parts.', example: 'The community lived in harmony with the natural world around them.', category: 'quality', etymology: "From Greek 'harmonia' (joint, agreement)" },
  { word: 'ambition', definition: 'A strong desire to achieve something, typically requiring determination and hard work.', example: 'His ambition drove him to climb the highest peaks on every continent.', category: 'quality', etymology: "From Latin 'ambitio' (going around)" },
  { word: 'loyalty', definition: 'A strong feeling of support, faithfulness, or allegiance to someone or something.', example: 'The old dog showed unwavering loyalty to its owner until the very end.', category: 'quality', etymology: "From Latin 'legalis' (legal)" },

  // Objects
  { word: 'sword', definition: 'A weapon with a long metal blade and a hilt, used for cutting or thrusting.', example: 'The ancient sword hung above the fireplace, a relic of forgotten wars.', category: 'object', etymology: "From Old English 'sweord'" },
  { word: 'crown', definition: 'A circular ornamental headdress worn by a monarch as a symbol of sovereignty and authority.', example: 'The golden crown gleamed under the cathedral lights.', category: 'object', etymology: "From Latin 'corona' (wreath)" },
  { word: 'shield', definition: 'A piece of protective armor carried to deflect weapons or blows.', example: 'He raised his shield just in time to block the incoming strike.', category: 'object', etymology: "From Old English 'scield'" },
  { word: 'lantern', definition: 'A lamp with a transparent case protecting the flame, often portable.', example: 'The old lantern cast a warm glow on the cottage walls.', category: 'object', etymology: "From Latin 'lanterna'" },
  { word: 'mirror', definition: 'A reflective surface, typically of glass coated with a metal amalgam, that produces an image.', example: 'She gazed into the mirror and saw a stranger staring back.', category: 'object', etymology: "From French 'miroir' (look at)" },
  { word: 'compass', definition: 'An instrument for determining direction, typically using a magnetic needle that points north.', example: 'Without a compass, they relied on the stars to navigate.', category: 'object', etymology: "From Latin 'compassus' (step)" },
  { word: 'feather', definition: 'A flat, light structure forming the plumage of birds, consisting of a central shaft and barbs.', example: 'A single white feather drifted down from the eagle overhead.', category: 'object', etymology: "From Old English 'feþer'" },
  { word: 'key', definition: 'A small piece of shaped metal used to open a lock, or a means of gaining access to something.', example: 'She turned the old brass key and the door creaked open.', category: 'object', etymology: "From Old English 'cǣg'" },
  { word: 'scroll', definition: 'A roll of parchment or paper for writing on, or to move text or images across a screen.', example: 'The ancient scroll contained secrets lost for centuries.', category: 'object', etymology: "From Latin 'scrolla' (roll)" },
  { word: 'gem', definition: 'A precious or semiprecious stone, especially one that has been cut and polished.', example: 'A brilliant red gem sat at the center of the ancient ring.', category: 'object', etymology: "From Latin 'gemma' (bud, jewel)" },
  { word: 'anchor', definition: 'A heavy device used to moor a vessel to the sea bottom; a source of stability.', example: 'She dropped the anchor and let the boat drift gently in the cove.', category: 'object', etymology: "From Latin 'ancora' (hook)" },
  { word: 'prism', definition: 'A transparent solid that refracts light, separating it into a spectrum of colors.', example: 'A prism turned the beam of sunlight into a vivid rainbow on the wall.', category: 'object', etymology: "From Greek 'prisma' (something sawed)" },

  // Actions
  { word: 'soar', definition: 'To fly or rise high in the air with little effort; to ascend above the ordinary.', example: 'The kite began to soar above the hilltops in the rising wind.', category: 'action', etymology: "From Latin 'exaltare' (raise)" },
  { word: 'dance', definition: 'To move rhythmically to music, or to move in a lively, spirited way.', example: 'Autumn leaves seemed to dance as they fell from the trees.', category: 'action', etymology: "From French 'danser'" },
  { word: 'shine', definition: 'To give off or reflect a bright light; to be eminent or conspicuous.', example: 'The polished silver began to shine in the candlelight.', category: 'action', etymology: "From Old English 'scīnan'" },
  { word: 'bloom', definition: 'To produce flowers; to reach a stage of full development or beauty.', example: 'Cherry trees bloom in a breathtaking display each spring.', category: 'action', etymology: "From Old Norse 'blōmi' (flower)" },
  { word: 'whisper', definition: 'To speak very softly using one\'s breath rather than vocal cords, often for secrecy.', example: 'The wind seemed to whisper secrets through the tall pines.', category: 'action', etymology: "From Old English 'hwisperian'" },
  { word: 'glow', definition: 'To emit a steady light, typically without flame; to have a warm, radiant appearance.', example: 'The embers continued to glow long after the fire had faded.', category: 'action', etymology: "From Old English 'glōwan'" },
  { word: 'sparkle', definition: 'To shine with flashes of light; to glitter or gleam.', example: 'Frost crystals sparkle on every surface in the morning sun.', category: 'action', etymology: "From Old Norse 'sparkr' (lively)" },
  { word: 'drift', definition: 'To be carried slowly by a current of air or water; to move aimlessly.', example: 'A small boat drifted gently down the winding river.', category: 'action', etymology: "From Old Norse 'drífa' (snowfall)" },
  { word: 'conquer', definition: 'To overcome and take control of something by force or through great effort.', example: 'She set out to conquer her fear of heights, one step at a time.', category: 'action', etymology: "From Latin 'conquirere' (to seek)" },
  { word: 'flourish', definition: 'To grow or develop in a healthy or vigorous way; to thrive.', example: 'With proper care, the garden began to flourish beyond all expectations.', category: 'action', etymology: "From Latin 'florere' (to bloom)" },
  { word: 'wander', definition: 'To move about without a definite destination or purpose; to roam.', example: 'They loved to wander the cobblestone streets of the old city.', category: 'action', etymology: "From Old English 'wandrian'" },
  { word: 'ascend', definition: 'To go up or climb to a higher position, level, or rank.', example: 'The hikers began to ascend the final ridge before the summit.', category: 'action', etymology: "From Latin 'ascendere' (to climb)" },
]

// Build a Map for O(1) lookup
const DEFINITION_MAP = new Map<string, WordDefinition>()
for (const def of DEFINITIONS) {
  DEFINITION_MAP.set(def.word, def)
}

/**
 * Get the definition data for a word. Returns undefined if not found.
 */
export function getWordDefinition(word: string): WordDefinition | undefined {
  return DEFINITION_MAP.get(word)
}

/**
 * Get all word definitions.
 */
export function getAllDefinitions(): WordDefinition[] {
  return DEFINITIONS
}
