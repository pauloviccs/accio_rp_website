import React from 'react';
import { MessagesSquare, Code2, ScrollText } from 'lucide-react';
import { DISCORD_INVITE_URL } from '../lib/constants';
import { ArcaneFrame, ArcaneDivider, AccioEmblem } from './ArcaneOrnaments';

interface FooterProps {
  onOpenLetter?: () => void;
  onOpenForm?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLetter, onOpenForm }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative">
      {/* Seção Pré-Rodapé Estilo ArcaneMP ("Sua Carta Chegou") */}
      <section className="chapter-valley relative isolate overflow-hidden px-6 py-24 sm:py-28">
        <ArcaneFrame className="z-10 mx-auto max-w-5xl bg-[#090e17]/80 px-6 py-14 sm:py-16 text-center backdrop-blur-sm sm:px-12">
          <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-[var(--house-border-strong)] shadow-[0_18px_35px_rgba(0,0,0,0.65)]">
            <img
              src="/assets/logohigh.jpg"
              alt="Selo ACCIO Roleplay"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>

          <p className="eyebrow mt-6">As portas estão abertas</p>
          <h2 className="title mt-4 text-3xl sm:text-5xl lg:text-6xl">
            Sua Carta Chegou
          </h2>
          <ArcaneDivider className="mx-auto mt-6" />

          <p className="mx-auto mt-6 max-w-[52ch] text-base sm:text-lg text-pretty text-[#d3d6dc]">
            Junte-se aos bruxos, construtores e narradores que estão moldando um mundo mágico compartilhado e garanta sua vaga no 1º lote de pioneiros.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessagesSquare />
              <span>Entrar no Discord Oficial</span>
            </a>

            {onOpenLetter && (
              <button
                type="button"
                onClick={onOpenLetter}
                className="btn-secondary"
              >
                <ScrollText />
                <span>Abrir Carta de Hogwarts</span>
              </button>
            )}
          </div>
        </ArcaneFrame>
      </section>

      {/* Rodapé Editorial de 12 Colunas (ArcaneMP) */}
      <div className="border-t border-[#c9b07a]/15 bg-[#090e17]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-12">

            <div className="col-span-2 md:col-span-5">
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-3 text-[#ece7da]"
              >
                <AccioEmblem className="size-9 shrink-0" />
                <span className="font-display text-2xl tracking-wide">ACCIO Roleplay</span>
              </a>

              <p className="mt-5 max-w-[40ch] text-[15px] text-[#b6bbc5]">
                Servidor de Roleplay MMO-RPG comunitário para Hogwarts Legacy, construído sobre o framework Arcane MP pela equipe VICCS Design e ACCIO Studios.
              </p>

              {/* Ícones Sociais em Losango Rotacionado 45° (Assinatura ArcaneMP) */}
              <div className="mt-7 flex items-center gap-6 pl-2">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord Oficial"
                  title="Entrar no Discord Oficial"
                  className="grid size-10 rotate-45 place-items-center border border-[#c9b07a]/35 text-[#c9b07a] transition hover:border-[#c9b07a] hover:bg-[#c9b07a]/10"
                >
                  <MessagesSquare className="size-[18px] -rotate-45" />
                </a>

                <a
                  href="https://arcane.mp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Arcane MP Framework"
                  title="Framework Arcane MP"
                  className="grid size-10 rotate-45 place-items-center border border-[#c9b07a]/35 text-[#c9b07a] transition hover:border-[#c9b07a] hover:bg-[#c9b07a]/10"
                >
                  <Code2 className="size-[18px] -rotate-45" />
                </a>
              </div>
            </div>

            <nav className="md:col-span-3 md:col-start-7" aria-label="Explorar">
              <h3 className="eyebrow">Explorar</h3>
              <ul role="list" className="mt-5 space-y-3 text-[15px] text-[#b6bbc5]">
                <li>
                  <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="transition hover:text-[var(--house-accent)] cursor-pointer"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo('castle-exploration')}
                    className="transition hover:text-[var(--house-accent)] cursor-pointer"
                  >
                    Estandartes 3D
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo('features')}
                    className="transition hover:text-[var(--house-accent)] cursor-pointer"
                  >
                    Sistemas do Servidor
                  </button>
                </li>
                {onOpenLetter && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenLetter}
                      className="transition hover:text-[var(--house-accent)] cursor-pointer"
                    >
                      Carta de Hogwarts
                    </button>
                  </li>
                )}
                {onOpenForm && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenForm}
                      className="transition hover:text-[var(--house-accent)] cursor-pointer"
                    >
                      Ficha de Pré-Registro
                    </button>
                  </li>
                )}
              </ul>
            </nav>

            <nav className="md:col-span-3 md:col-start-10" aria-label="Recursos">
              <h3 className="eyebrow">Recursos</h3>
              <ul role="list" className="mt-5 space-y-3 text-[15px] text-[#b6bbc5]">
                <li>
                  <a
                    href={DISCORD_INVITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-[var(--house-accent)]"
                  >
                    Discord Oficial
                  </a>
                </li>
                <li>
                  <a
                    href="https://arcane.mp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-[var(--house-accent)]"
                  >
                    Arcane MP
                  </a>
                </li>
              </ul>
            </nav>

          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-[#c9b07a]/15 pt-8 text-sm text-[#8b93a1] sm:flex-row sm:justify-between">
            <p>© 2026 ACCIO Roleplay · Desenvolvido por VICCS Design. Projeto comunitário sem fins lucrativos.</p>
            <p className="max-w-[60ch] text-[13px] sm:text-right">
              Hogwarts Legacy e o Wizarding World são marcas registradas da Warner Bros. Entertainment Inc. Sem afiliação oficial com Warner Bros., Avalanche Software ou Portkey Games.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
