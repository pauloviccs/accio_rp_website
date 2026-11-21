import React from 'react';
import { Wand2, Scroll, Coins, Volume2, ShieldCheck, Compass } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Wand2,
      title: 'Sistema de Feitiços Dinâmico',
      description: 'Feitiços originais e customizados com maestria progressiva. Desenvolva seu estilo de duelo sem limitações de classes pré-moldadas.',
      tag: 'Arcane MP Core'
    },
    {
      icon: Scroll,
      title: 'Roleplay com Histórias Profundas',
      description: 'Exigência mínima de 3.000 palavras para personagens principais. Uma comunidade selecionada que valoriza narrativa, lore e coerência.',
      tag: 'Narrativa Séria'
    },
    {
      icon: Coins,
      title: 'Economia Real e Comércio',
      description: 'Galeões, Sicles e Knuts com valor real. Adquira varinhas raras, ingredientes no Beco Diagonal e participe do comércio de Hogsmeade.',
      tag: 'Economia Viva'
    },
    {
      icon: Volume2,
      title: 'Proximity Voice 3D (Opus)',
      description: 'Converse com bruxos ao seu redor com atenuação acústica realista pelos corredores do castelo e eco nas masmorras.',
      tag: 'Imersão Auditiva'
    },
    {
      icon: Compass,
      title: 'Aulas Acadêmicas & Casas',
      description: 'Participe de aulas com professores experientes, ganhe pontos para sua Casa e dispute a cobiçada Taça das Casas.',
      tag: 'Vida Escolar'
    },
    {
      icon: ShieldCheck,
      title: 'Segurança & Anti-Cheat',
      description: 'Servidor totalmente autoritativo no Node.js. Validação de inventário, combate e movimentação contra qualquer trapaça.',
      tag: 'Tecnologia'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#B83A0C]/20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-[0.25em] text-[#FFC34F] font-bold block mb-2">
          O Futuro do Roleplay Mágico
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-[#FFF0B2] mb-4">
          Muito Além do Jogo Original.
        </h2>
        <p className="font-crimson text-lg text-[#FFF0B2]/70">
          Transformamos o mapa colossal de Hogwarts Legacy em uma experiência multiplayer persistente,
          onde cada decisão do seu personagem reverbera por todo o servidor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="bg-accio-card rounded-2xl p-6 sm:p-8 hover:border-[#FFC34F]/40 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B1009] to-[#210604] border border-[#B83A0C]/40 flex items-center justify-center text-[#FFC34F] group-hover:scale-110 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#B83A0C]/20 border border-[#B83A0C]/40 text-[#FFC34F]">
                  {feat.tag}
                </span>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-[#FFF0B2] mb-3 group-hover:text-[#FFC34F] transition">
                {feat.title}
              </h3>
              <p className="text-sm text-[#FFF0B2]/70 leading-relaxed font-sans">
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

