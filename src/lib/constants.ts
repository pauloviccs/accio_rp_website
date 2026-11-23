import { HouseId, WandHandleOption } from '../types';

export const HOUSES: Record<HouseId, {
  name: string;
  color: string;
  secondaryColor: string;
  borderColor: string;
  bgGradient: string;
  motto: string;
  traits: string[];
  description: string;
}> = {
  gryffindor: {
    name: 'Grifinória',
    color: '#9C1B28',
    secondaryColor: '#D4A844',
    borderColor: 'rgba(212, 168, 68, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(156, 27, 40, 0.3) 0%, rgba(22, 5, 4, 0.8) 100%)',
    motto: 'Onde habitam os corações indômitos',
    traits: ['Coragem', 'Determinação', 'Audácia'],
    description: 'Famosa por acolher os mais audaciosos e cavalheirescos bruxos de Hogwarts.'
  },
  slytherin: {
    name: 'Sonserina',
    color: '#1A6B3C',
    secondaryColor: '#A0A0A0',
    borderColor: 'rgba(160, 160, 160, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(26, 107, 60, 0.3) 0%, rgba(22, 5, 4, 0.8) 100%)',
    motto: 'Aqueles de grande ambição e astúcia',
    traits: ['Astúcia', 'Engenhosidade', 'Liderança'],
    description: 'O lar dos que usam todos os meios para alcançar os cumes da grandeza mágica.'
  },
  ravenclaw: {
    name: 'Corvinal',
    color: '#0B4F8A',
    secondaryColor: '#946B2D',
    borderColor: 'rgba(148, 107, 45, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(11, 79, 138, 0.3) 0%, rgba(22, 5, 4, 0.8) 100%)',
    motto: 'O espírito sem limites é o maior tesouro',
    traits: ['Sabedoria', 'Intelecto', 'Criatividade'],
    description: 'Onde o intelecto refinado e a curiosidade incessante desvendam os arcanos do mundo.'
  },
  hufflepuff: {
    name: 'Lufa-Lufa',
    color: '#D4A844',
    secondaryColor: '#2D2D2D',
    borderColor: 'rgba(212, 168, 68, 0.4)',
    bgGradient: 'linear-gradient(135deg, rgba(212, 168, 68, 0.3) 0%, rgba(22, 5, 4, 0.8) 100%)',
    motto: 'Onde a lealdade e o esforço imperam',
    traits: ['Lealdade', 'Paciência', 'Justiça'],
    description: 'Dedicados ao trabalho duro, à verdade e à honra fraternal entre todos os bruxos.'
  }
};

export const WAND_WOODS = [
  'Azevinho', 'Carvalho Inglês', 'Sabugueiro', 'Pereira', 'Teixo', 
  'Jacarandá', 'Ébano', 'Cerejeira', 'Cedro', 'Freixo', 
  'Videira', 'Salgueiro', 'Castanheira', 'Nogueira Negra', 'Espinheiro-Negro'
];

export const WAND_CORES = [
  'Pena de Fênix', 'Fibra de Coração de Dragão', 'Pelo de Unicórnio',
  'Pelo de Testrálio', 'Escama de Serpente Chifruda', 'Pena de Pássaro-Trovão'
];

export const WAND_LENGTHS = [
  '9½ polegadas', '10 polegadas', '10¾ polegadas', '11 polegadas', 
  '11½ polegadas', '12 polegadas', '12¼ polegadas', '13 polegadas', 
  '13½ polegadas', '14 polegadas'
];

export const WAND_FLEXIBILITIES = [
  'Inflexível', 'Rígida', 'Firme', 'Sólida', 
  'Levemente Elástica', 'Maleável', 'Surpreendentemente Flexível', 'Dócil'
];

export const MIN_WORDS_BACKSTORY = 3000;
export const TOTAL_PIONEER_SLOTS = 100;
export const LOCAL_STORAGE_DRAFT_KEY = 'accio_character_backstory_draft_v2';
export const LOCAL_STORAGE_FORM_KEY = 'accio_character_form_draft_v2';
export const LOCAL_STORAGE_LETTER_KEY = 'accio_letter_opened_v2';

// Prazo de pré-registro: 61 dias exatos a partir da data de abertura (21/11/2026 até 21/01/2027)
export const PRE_REGISTRATION_DAYS = 61;
export const TARGET_PHASE_END_DATE = '2027-01-21T23:59:59.000Z';

// Catálogo Canônico de Cabos de Varinha de Hogwarts Legacy (11 Famílias Visuais)
export const WAND_HANDLES: WandHandleOption[] = [
  {
    id: 'arrow-black',
    name: 'Arrow — Black',
    family: 'Flecha',
    colorName: 'Ébano & Latão',
    iconImg: '/wands/Arrow-black.webp',
    handleImg: '/wands/Arrow_-_Black_wand_handle.webp',
    sketchImg: '/wands/Arrow_Black_wand-handle_sketch.webp',
    description: 'Entalhes angulares em chevron inspirados nas plumas de uma flecha, com fuste em ébano lustroso e anéis de contenção em latão.',
  },
  {
    id: 'avian-grey',
    name: 'Avian — Grey',
    family: 'Aviário',
    colorName: 'Grafite & Bronze',
    iconImg: '/wands/Avian-grey.webp',
    handleImg: '/wands/Avian_-_Grey_wand_handle.webp',
    sketchImg: '/wands/Avian_-_Grey_sketch.webp',
    description: 'Pomo majestoso esculpido em forma de águia imperial com colar de penas cinzeladas e fuste em pedra cinzenta polida.',
  },
  {
    id: 'basketweave-black',
    name: 'Basketweave — Black',
    family: 'Cesto Trançado',
    colorName: 'Couro Negro & Bronze',
    iconImg: '/wands/Basketweave-black.webp',
    handleImg: '/wands/Basketweave_-_Black_wand_handle.webp',
    sketchImg: '/wands/Basketweave_-_Black_field_guide_sketch.webp',
    description: 'Trama entrelaçada em relevo geométrico simulando couro batido resistente com guarnição de bronze gótico.',
  },
  {
    id: 'botanical-gold',
    name: 'Botanical — Gold Leaf',
    family: 'Botânico',
    colorName: 'Folhas de Ouro',
    iconImg: '/wands/Botanical-gold.webp',
    handleImg: '/wands/Botanical_-_Gold_Leaf_wand_handle.webp',
    sketchImg: '/wands/Botanical_-_Silver_Leaf_sketch.webp',
    description: 'Delicadas folhas de acanto e gavinhas botânicas banhadas a ouro antigo que serpenteiam a empunhadura do bruxo.',
  },
  {
    id: 'celestial-blue',
    name: 'Celestial — Blue',
    family: 'Celestial',
    colorName: 'Azul Safira & Prata',
    iconImg: '/wands/Celestial-blue.webp',
    handleImg: '/wands/Celestial_Blue_handle.webp',
    sketchImg: '/wands/Celestial_-_Blue_sketch.webp',
    description: 'Inspirado em instrumentos astronômicos do século XIX, com esferas armilares, anéis orbitais e esmalte azul profundo.',
  },
  {
    id: 'checkerboard-teal',
    name: 'Checkerboard — Teal',
    family: 'Xadrez / Mosaico',
    colorName: 'Malaquita & Teca',
    iconImg: '/wands/Checkerboard_Teal_icon.webp',
    handleImg: '/wands/Checkerboard_-_Teal_wand_handle.webp',
    sketchImg: '/wands/Checkerboard_Teal_wand-handle_sketch.webp',
    description: 'Marchetaria quadriculada de alta precisão com incrustações de malaquita verde-azulado e madeira nobre encerada.',
  },
  {
    id: 'column-dark-brown',
    name: 'Column — Dark Brown',
    family: 'Coluna Clássica',
    colorName: 'Nogueira Imperial',
    iconImg: '/wands/Column_Dark_Brown_icon.webp',
    handleImg: '/wands/Column_-_Dark_Brown_wand_handle.webp',
    sketchImg: '/wands/Column_Dark_Brown_sketch.webp',
    description: 'Caneluras longitudinais inspiradas na arquitetura jônica antiga com capitel circular e nogueira escura envernizada.',
  },
  {
    id: 'corkscrew-brown',
    name: 'Corkscrew — Brown',
    family: 'Espiral Torcida',
    colorName: 'Carvalho Tostado',
    iconImg: '/wands/Corkscrew-brown.webp',
    handleImg: '/wands/Corkscrew_-_Brown_wand_handle.webp',
    sketchImg: '/wands/Corkscrew_Brown_sketch.webp',
    description: 'Esculpido em dupla hélice contínua proporcionando uma empunhadura anatômica natural e estabilidade em duelos arcanos.',
  },
  {
    id: 'imperial-brown-gold',
    name: 'Imperial — Brown & Gold',
    family: 'Imperial',
    colorName: 'Mogno Real & Ouro 24k',
    iconImg: '/wands/Imperial-brown-gold.webp',
    handleImg: '/wands/Imperial_-_Brown_and_Gold_wand_handle.webp',
    sketchImg: '/wands/Imperial_-_Brown_and_Gold_Field_Guide_sketch.webp',
    description: 'Cabo de cetro ministerial com arabescos barrocos dourados, acabamento suntuoso e equilíbrio impecável de duelo.',
  },
  {
    id: 'orbicular-gold',
    name: 'Orbicular — Gold',
    family: 'Orbicular',
    colorName: 'Ouro Velho & Cerejeira',
    iconImg: '/wands/Orbicular-gold.webp',
    handleImg: '/wands/Orbicular_-_Gold_wand_handle.webp',
    sketchImg: '/wands/Orbicular_-_Gold_Field_Guide_sketch.webp',
    description: 'Segmentação em globos metálicos torneados com pomo esférico de contrapeso em ouro envelhecido.',
  },
  {
    id: 'regal-blue',
    name: 'Regal — Blue',
    family: 'Régio',
    colorName: 'Azul Ultramarino & Platina',
    iconImg: '/wands/Regal-blue.webp',
    handleImg: '/wands/Regal_Blue_Wand-handle.webp',
    sketchImg: '/wands/Regal_-_Blue_sketch.webp',
    description: 'Faixas heráldicas com coroas lavradas em baixo relevo e esmalte azul nobre sobre ligas nobres anti-maldição.',
  },
];

// Tradição Canônica de Garrick Ollivanders (Pottermore Lore)
export const OLLIVANDERS_CORE_LORE: Record<string, string> = {
  'Pena de Fênix': 'O núcleo mais raro e independente. Capaz da maior gama de magias e grande iniciativa própria, embora leve mais tempo para revelar sua lealdade total.',
  'Fibra de Coração de Dragão': 'Produz os feitiços mais poderosos e vistosos. Aprende novas magias com extrema rapidez, ligando-se fortemente ao mestre atual.',
  'Pelo de Unicórnio': 'Gera a magia mais consistente e pura, menos propensa a flutuações e bloqueios. É o núcleo mais leal e resistente às Artes das Trevas.',
  'Pelo de Testrálio': 'Substância complexa e misteriosa que exige maestria do conjurador. Apenas bruxos capazes de compreender a morte dominam sua essência profunda.',
  'Escama de Serpente Chifruda': 'Rara gema oculta na cabeça da grande serpente. Excepcionalmente sensível ao perigo, emite notas musicais ao pressentir ameaças.',
  'Pena de Pássaro-Trovão': 'Poderosa e volátil, intimamente ligada à transfiguração e a tempestades elementais. Capaz de disparar feitiços defensivos instintivamente.'
};

// Webhook oficial do Discord para notificações formatadas de inscrições
export const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1573768137713651712/11WwWCSYtxX6X19_rwJZOK6fD-Vy3pMtCo1VBzS-fD1pa9eVel4AQccBJgbmsxbof6EP';
