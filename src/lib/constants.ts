import { HouseId } from '../types';

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
export const LOCAL_STORAGE_DRAFT_KEY = 'accio_character_backstory_draft_v1';
export const LOCAL_STORAGE_FORM_KEY = 'accio_character_form_draft_v1';
