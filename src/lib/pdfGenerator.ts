import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CharacterApplication } from '../types';
import { HOUSES, WAND_HANDLES, OLLIVANDERS_CORE_LORE } from './constants';
import { supabase } from './supabase';

/**
 * Gera a Ficha Oficial de Inscrição em Hogwarts em PDF de alta resolução,
 * com acabamento visual de pergaminho antigo, tinta sépia, selo de cera,
 * dados canônicos do personagem, varinha e histórico de 3.000 palavras.
 * 
 * Faz o download imediato para o usuário e sincroniza o PDF no Supabase Storage.
 */
export async function generateAndDownloadCharacterPdf(
  app: CharacterApplication,
  onProgress?: (status: string) => void
): Promise<{ pdfUrl: string | null; success: boolean }> {
  try {
    if (onProgress) onProgress('Preparando o pergaminho ministerial...');

    const houseInfo = HOUSES[app.preferred_house] || HOUSES.gryffindor;
    const wandHandle = WAND_HANDLES.find((w) => w.name === app.wand_handle || w.id === app.wand_handle) || WAND_HANDLES[0];
    const ticketNum = app.registration_number ? `#ACCIO-${String(app.registration_number).padStart(4, '0')}` : '#ACCIO-0001';
    const coreDescription = OLLIVANDERS_CORE_LORE[app.wand_core] || 'Núcleo dotado de extraordinária ressonância mágica.';

    // 1. Criar container DOM temporário fora da tela
    const printContainer = document.createElement('div');
    printContainer.style.position = 'fixed';
    printContainer.style.top = '-99999px';
    printContainer.style.left = '-99999px';
    printContainer.style.width = '794px'; // Largura padrão A4 (96 DPI)
    printContainer.style.minHeight = '1123px'; // Altura padrão A4
    printContainer.style.zIndex = '-9999';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.color = '#2B1408';
    printContainer.style.fontFamily = 'Georgia, "Times New Roman", serif';
    printContainer.style.backgroundColor = '#F5E8C7';

    // 2. Montar HTML enriquecido do pergaminho canônico
    printContainer.innerHTML = `
      <div style="
        width: 794px;
        min-height: 1123px;
        padding: 40px;
        box-sizing: border-box;
        background: radial-gradient(circle at center, #FBF4DE 0%, #EFE1B8 75%, #D4BE82 100%);
        border: 14px solid #3B1207;
        outline: 3px double #C4973B;
        position: relative;
        overflow: hidden;
      ">
        <!-- Marca d'Água Central de Hogwarts -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 480px;
          height: 480px;
          opacity: 0.05;
          pointer-events: none;
          background-image: url('/assets/logohigh.jpg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        "></div>

        <!-- Bordas ornamentais douradas nos cantos (SVG) -->
        <svg style="position: absolute; top: 12px; left: 12px; width: 20px; height: 20px; color: #8A5A1B;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/></svg>
        <svg style="position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; color: #8A5A1B;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/></svg>
        <svg style="position: absolute; bottom: 12px; left: 12px; width: 20px; height: 20px; color: #8A5A1B;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/></svg>
        <svg style="position: absolute; bottom: 12px; right: 12px; width: 20px; height: 20px; color: #8A5A1B;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/></svg>

        <!-- CABEÇALHO MINISTERIAL -->
        <div style="text-align: center; border-bottom: 2px solid #8A5A1B; padding-bottom: 16px; margin-bottom: 22px;">
          <div style="font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: #733E10; font-weight: bold; margin-bottom: 4px;">
            Ministério da Magia · Departamento de Educação Mágica
          </div>
          <h1 style="font-size: 26px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #3B1207; margin: 0 0 4px 0; font-family: 'Cinzel', serif, Georgia;">
            Escola de Magia e Bruxaria de Hogwarts
          </h1>
          <div style="font-size: 13px; font-style: italic; color: #52270E;">
            Registro Oficial de Matrícula & Livro da Admissão · Turma dos Anos 2000
          </div>
          <div style="display: inline-block; margin-top: 8px; padding: 4px 16px; background-color: #3B1207; color: #FFD580; font-size: 11px; font-weight: bold; border-radius: 4px; letter-spacing: 0.15em;">
            BILHETE OFICIAL DO EXPRESSO: ${ticketNum}
          </div>
        </div>

        <!-- CORPO PRINCIPAL EM 2 COLUNAS (IDENTIDADE & CASA) -->
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          
          <!-- Coluna 1: Dados do Aluno -->
          <div style="flex: 1.2; background: rgba(255, 255, 255, 0.4); padding: 14px; border: 1px solid #C4973B; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #733E10; border-bottom: 1px solid #D4BE82; padding-bottom: 4px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <svg style="width: 14px; height: 14px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#733E10" stroke-width="2"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>
              <span>Identidade do Estudante</span>
            </div>
            
            <div style="margin-bottom: 6px;">
              <span style="font-size: 10px; text-transform: uppercase; color: #733E10; font-weight: bold;">Nome Completo:</span>
              <div style="font-size: 16px; font-weight: bold; color: #2B1408;">${app.first_name} ${app.last_name}</div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 6px;">
              <div>
                <span style="font-size: 10px; text-transform: uppercase; color: #733E10; font-weight: bold;">Nascimento:</span>
                <div style="font-size: 12px; font-weight: 600;">${app.birth_date}</div>
              </div>
              <div>
                <span style="font-size: 10px; text-transform: uppercase; color: #733E10; font-weight: bold;">Local de Origem:</span>
                <div style="font-size: 12px; font-weight: 600;">${app.birth_place}</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 6px;">
              <div>
                <span style="font-size: 10px; text-transform: uppercase; color: #733E10; font-weight: bold;">Linhagem Sanguínea:</span>
                <div style="font-size: 12px; font-weight: 600;">
                  ${app.blood_status === 'pure-blood' ? 'Sangue-Puro' : app.blood_status === 'half-blood' ? 'Mestiço' : 'Nascido-Trouxa'}
                </div>
              </div>
              <div>
                <span style="font-size: 10px; text-transform: uppercase; color: #733E10; font-weight: bold;">Patrono:</span>
                <div style="font-size: 12px; font-weight: 600;">${app.patronus || 'Em despertar interior'}</div>
              </div>
            </div>

            <div>
              <span style="font-size: 10px; text-transform: uppercase; color: #733E10; font-weight: bold;">Identificador Discord:</span>
              <div style="font-size: 11px; font-family: monospace; color: #4A230D;">@${app.discord_username} (${app.discord_id})</div>
            </div>
          </div>

          <!-- Coluna 2: Casa de Hogwarts -->
          <div style="flex: 0.8; background: rgba(255, 255, 255, 0.4); padding: 14px; border: 1px solid #C4973B; border-radius: 6px; text-align: center;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #733E10; border-bottom: 1px solid #D4BE82; padding-bottom: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <svg style="width: 14px; height: 14px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#733E10" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Casa Designada</span>
            </div>
            
            <div style="font-size: 20px; font-weight: 900; color: ${houseInfo.color}; margin-bottom: 2px;">
              ${houseInfo.name}
            </div>
            <div style="font-size: 11px; font-style: italic; color: #613612; margin-bottom: 8px;">
              "${houseInfo.motto}"
            </div>

            <div style="background-color: #EBD6A7; padding: 6px; border-radius: 4px; font-size: 10px; line-height: 1.4; color: #3B1207;">
              <strong>Virtudes Cardeais:</strong><br/>
              ${houseInfo.traits.join(' • ')}
            </div>
          </div>
        </div>

        <!-- SEÇÃO DA VARINHA (OLLIVANDERS & HOGWARTS LEGACY) -->
        <div style="background: rgba(255, 255, 255, 0.5); padding: 14px; border: 1px solid #C4973B; border-radius: 6px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #733E10; border-bottom: 1px solid #D4BE82; padding-bottom: 4px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
            <svg style="width: 14px; height: 14px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#733E10" stroke-width="2"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/></svg>
            <span>Varinha do Bruxo · Fabricação de Ollivanders (Beco Diagonal)</span>
          </div>

          <div style="display: flex; gap: 16px; align-items: center;">
            
            <!-- Imagens do Cabo e Guia de Campo -->
            <div style="display: flex; gap: 8px; flex-shrink: 0;">
              <div style="width: 80px; height: 80px; background: #2B1408; border: 1px solid #8A5A1B; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img src="${wandHandle.handleImg}" style="width: 100%; height: 100%; object-fit: cover;" alt="Cabo da Varinha" />
              </div>
              <div style="width: 80px; height: 80px; background: #DFCDA4; border: 1px solid #8A5A1B; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img src="${wandHandle.sketchImg}" style="width: 100%; height: 100%; object-fit: cover;" alt="Esboço Guia de Campo" />
              </div>
            </div>

            <!-- Especificações da Varinha -->
            <div style="flex: 1; font-size: 11px; line-height: 1.5;">
              <div><strong>Modelo do Cabo:</strong> ${wandHandle.name} (${wandHandle.colorName})</div>
              <div><strong>Madeira do Fuste:</strong> ${app.wand_wood}</div>
              <div><strong>Núcleo Mágico:</strong> ${app.wand_core}</div>
              <div><strong>Comprimento & Flexibilidade:</strong> ${app.wand_length} · ${app.wand_flexibility}</div>
              <div style="font-size: 10px; font-style: italic; color: #5E3211; margin-top: 4px;">
                "${coreDescription}"
              </div>
            </div>
          </div>
        </div>

        <!-- EXTRATO DA CRÔNICA DO PERSONAGEM (HISTÓRIA DE 3.000 PALAVRAS) -->
        <div style="background: rgba(255, 255, 255, 0.4); padding: 14px; border: 1px solid #C4973B; border-radius: 6px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #D4BE82; padding-bottom: 4px; margin-bottom: 8px;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; color: #733E10; display: flex; align-items: center; gap: 6px;">
              <svg style="width: 14px; height: 14px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#733E10" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Crônica Lavrada no Livro da Admissão</span>
            </div>
            <div style="font-size: 10px; font-weight: bold; color: #2E6B34; display: flex; align-items: center; gap: 4px;">
              <svg style="width: 12px; height: 12px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#2E6B34" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${app.word_count.toLocaleString()} Palavras Aprovadas</span>
            </div>
          </div>

          <div style="font-size: 11px; line-height: 1.6; color: #2B1408; text-align: justify; max-height: 220px; overflow: hidden; font-style: italic;">
            ${app.character_backstory.substring(0, 750)}...
          </div>
          <div style="font-size: 9px; text-align: right; color: #733E10; margin-top: 6px; font-weight: bold;">
            (Crônica integral com ${app.word_count.toLocaleString()} palavras arquivada sob o selo de confidencialidade ministerial)
          </div>
        </div>

        <!-- RODAPÉ COM ASSINATURAS E CARIMBO DE CERA -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #8A5A1B; padding-top: 14px;">
          
          <!-- Carimbo de Cera Escarlate -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="
              width: 58px;
              height: 58px;
              border-radius: 50%;
              background: radial-gradient(circle at 35% 35%, #BA2424 0%, #7A1010 70%, #450808 100%);
              border: 3px solid #D4A844;
              box-shadow: 2px 3px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFD580;
              font-size: 22px;
              font-family: serif;
              font-weight: 900;
            ">
              H
            </div>
            <div>
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #3B1207;">Selo Ministerial de Hogwarts</div>
              <div style="font-size: 9px; color: #733E10;">Lavrado em ${new Date().toLocaleDateString('pt-BR')}</div>
              <div style="font-size: 8px; color: #4CAF7C; font-weight: bold;">● REGISTRO PERSISTENTE ARCANE MP</div>
            </div>
          </div>

          <!-- Assinaturas Canônicas -->
          <div style="display: flex; gap: 24px; text-align: center;">
            <div>
              <div style="font-family: 'Brush Script MT', cursive, Georgia; font-size: 18px; color: #3B1207; margin-bottom: -4px;">
                Albus Dumbledore
              </div>
              <div style="border-top: 1px solid #8A5A1B; width: 140px; font-size: 9px; text-transform: uppercase; color: #733E10; padding-top: 2px;">
                Diretor de Hogwarts
              </div>
            </div>

            <div>
              <div style="font-family: 'Brush Script MT', cursive, Georgia; font-size: 18px; color: #3B1207; margin-bottom: -4px;">
                Minerva McGonagall
              </div>
              <div style="border-top: 1px solid #8A5A1B; width: 140px; font-size: 9px; text-transform: uppercase; color: #733E10; padding-top: 2px;">
                Vice-Diretora
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(printContainer);

    if (onProgress) onProgress('Renderizando selos mágicos e imagens...');

    // 3. Renderizar com html2canvas em alta definição (escala 2x para nitidez 300 DPI)
    const canvas = await html2canvas(printContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#F5E8C7',
      logging: false,
    });

    document.body.removeChild(printContainer);

    if (onProgress) onProgress('Compilando pergaminho em PDF...');

    // 4. Montar o documento jsPDF (A4 Retrato)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    // 5. Salvar localmente no computador do usuário
    const fileName = `Ficha_Hogwarts_${app.first_name}_${app.last_name}.pdf`.replace(/\s+/g, '_');
    pdf.save(fileName);

    if (onProgress) onProgress('Sincronizando com os tomos de Hogwarts...');

    // 6. Fazer upload do PDF para o Supabase Storage no bucket 'character_sheets'
    let publicPdfUrl: string | null = null;
    try {
      const blob = pdf.output('blob');
      const storagePath = `${app.id || app.discord_id}_ficha_oficial.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('character_sheets')
        .upload(storagePath, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('character_sheets')
          .getPublicUrl(storagePath);

        publicPdfUrl = urlData.publicUrl;

        // Atualizar na tabela character_applications
        if (app.id) {
          await supabase
            .from('character_applications')
            .update({ pdf_url: publicPdfUrl })
            .eq('id', app.id);
        }
      }
    } catch (storageErr) {
      console.warn('PDF gerado localmente; sincronização com Supabase Storage não pôde ser completada:', storageErr);
    }

    if (onProgress) onProgress('Pronto! Ficha baixada com sucesso.');

    return {
      pdfUrl: publicPdfUrl,
      success: true,
    };
  } catch (error) {
    console.error('Falha ao gerar o PDF da ficha:', error);
    if (onProgress) onProgress('Erro ao gerar pergaminho.');
    return {
      pdfUrl: null,
      success: false,
    };
  }
}

