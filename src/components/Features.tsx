import React from 'react';
import { Wand2, Scroll, Coins, Volume2, ShieldCheck, Compass } from 'lucide-react';
import { ArcaneFrame, ArcaneDivider } from './ArcaneOrnaments';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Wand2,
      title: 'Sistema de Feitiços Dinâmico',
      description: 'Feitiços originais e customizados com maestria progressiva. Desenvolva seu estilo de duelo sem limitações de classes pré-moldadas.',
      tag: 'Arcane MP Core',
    },
    {
      icon: Scroll,
      title: 'Roleplay com Histórias Profundas',
      description: 'Exigência mínima de 3.000 palavras para personagens principais. Uma comunidade selecionada que valoriza narrativa, lore e coerência.',
      tag: 'Narrativa Séria',
    },
    {
      icon: Coins,
      title: 'Economia Real e Comércio',
      description: 'Galeões, Sicles e Knuts com valor real. Adquira varinhas raras, ingredientes no Beco Diagonal e participe do comércio de Hogsmeade.',
      tag: 'Economia Viva',
    },
    {
      icon: Volume2,
      title: 'Proximity Voice 3D (Opus)',
      description: 'Converse com bruxos ao seu redor com atenuação acústica realista pelos corredores do castelo e eco nas masmorras.',
      tag: 'Imersão Auditiva',
    },
    {
      icon: Compass,
      title: 'Aulas Acadêmicas & Casas',
      description: 'Participe de aulas com professores experientes, ganhe pontos para sua Casa e dispute a cobiçada Taça das Casas.',
      tag: 'Vida Escolar',
    },
    {
      icon: ShieldCheck,
      title: 'Segurança & Anti-Cheat',
      description: 'Servidor totalmente autoritativo no Node.js. Validação de inventário, combate e movimentação contra qualquer trapaça.',
      tag: 'Tecnologia',
    },
  ];

  return (
    <section id="features" className="relative isolate overflow-hidden py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
        <p className="eyebrow">O Futuro do Roleplay Mágico</p>
        <h2 className="title mt-4 text-3xl sm:text-5xl">
          Muito Além do Jogo Original.
        </h2>
        <ArcaneDivider className="mt-6" />
        <p className="mt-6 max-w-[56ch] text-pretty text-[#b6bbc5]">
          Transformamos o mapa colossal de Hogwarts Legacy em uma experiência multiplayer persistente,
          onde cada decisão do seu personagem reverbera por todo o servidor.
        </p>
      </div>

      <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <li key={idx}>
              <ArcaneFrame className="flex h-full flex-col p-6 sm:p-7 hover:border-[var(--house-accent)]/60 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 arch bg-[#0d1422] border border-[var(--house-border)] flex items-center justify-center text-[var(--house-accent)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="eyebrow text-[10px] px-2.5 py-1 bg-[#0d1422] border border-[var(--house-border)]">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="font-display text-2xl text-[#efe4cc] mb-3">
                  {feat.title}
                </h3>
                <p className="text-[15px] text-[#b6bbc5] leading-relaxed">
                  {feat.description}
                </p>
              </ArcaneFrame>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
