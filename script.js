// Dados brutos fictícios padronizados do 9º Ano
const dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// NOTA SOBRE FREQUÊNCIA:
// O valor de 92% exibido no card é APENAS FICTÍCIO/DEMONSTRATIVO para esta primeira etapa
// e será calculado/tratado de forma dinâmica a partir de dados reais no futuro.

/**
 * Função para normalizar notas na escala de 0 a 10
 */
function normalizarNota(valor) {
  // Trata valores ausentes (null, undefined, texto vazio)
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Converte texto com vírgula para número com ponto decimal
  let numStr = String(valor).replace(",", ".");
  let num = parseFloat(numStr);

  // Se não for um número válido, descarta
  if (isNaN(num)) {
    return null;
  }

  // Regra de conversão: entre 0 e 10
  if (num >= 0 && num <= 10) {
    return num;
  }

  // Valores maiores que 10 e até 100 são divididos por 10 (ex: 85 -> 8.5)
  if (num > 10 && num <= 100) {
    return num / 10;
  }

  // Fora das regras, considera inválido
  return null;
}

/**
 * Formata a exibição da nota na tabela
 */
function formatarExibicaoNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace(".", ",");
}

/**
 * Renderiza o boletim inteiro no HTML
 */
function carregarBoletim() {
  const corpoTabela = document.getElementById("tabela-corpo");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  // Passa por cada disciplina da lista
  dadosBoletim.forEach(item => {
    // Normaliza as notas dos 3 trimestres
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Soma apenas as notas que existem
    let somaNotas = 0;
    let qtdNotas = 0;

    if (n1 !== null) { somaNotas += n1; qtdNotas++; }
    if (n2 !== null) { somaNotas += n2; qtdNotas++; }
    if (n3 !== null) { somaNotas += n3; qtdNotas++; }

    // Calcula a média da disciplina
    let media = null;
    let situacaoTexto = "Nota ainda não disponível";
    let situacaoClasse = "badge-indisponivel";

    if (qtdNotas > 0) {
      media = somaNotas / qtdNotas;
      somaMediasGerais += media;
      qtdDisciplinasComMedia++;

      if (media >= 6.0) {
        situacaoTexto = "Bom desempenho";
        situacaoClasse = "badge-bom";
        qtdBomDesempenho++;
      } else {
        situacaoTexto = "Atenção";
        situacaoClasse = "badge-atencao";
        qtdAtencao++;
      }
    }

    // Soma as faltas dos trimestres
    const totalFaltasDisc = item.faltas.reduce((acc, curr) => acc + curr, 0);
    totalFaltasGeral += totalFaltasDisc;

    // Cria a linha da tabela (tr)
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarExibicaoNota(n1)}</td>
      <td>${formatarExibicaoNota(n2)}</td>
      <td>${formatarExibicaoNota(n3)}</td>
      <td><strong>${media !== null ? media.toFixed(1).replace(".", ",") : "—"}</strong></td>
      <td>${totalFaltasDisc}</td>
      <td><span class="badge ${situacaoClasse}">${situacaoTexto}</span></td>
    `;

    corpoTabela.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no DOM
  const mediaGeral = qtdDisciplinasComMedia > 0 ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") : "—";
  
  document.getElementById("card-media-geral").textContent = mediaGeral;
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-precisam-atencao").textContent = qtdAtencao;
}

// Executa a função assim que a página carregar
window.addEventListener("DOMContentLoaded", carregarBoletim);

