// Configuração fixa do aluno
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 16,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variável para manter o PIN apenas em memória durante a sessão
let pinSessao = "";
let modoEdicao = false;

// Dados brutos fictícios padronizados do 9º Ano
let dadosBoletim = [
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
 * Função para normalizar notas antigas/locais na escala de 0 a 10
 */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numStr = String(valor).replace(",", ".");
  let num = parseFloat(numStr);

  if (isNaN(num)) {
    return null;
  }

  if (num >= 0 && num <= 10) {
    return num;
  }

  if (num > 10 && num <= 100) {
    return num / 10;
  }

  return null;
}

/**
 * Formata a exibição da nota na tabela
 */
function formatarExibicaoNota(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  return Number(nota).toFixed(1).replace(".", ",");
}

/**
 * Valida a entrada do usuário ao editar uma nota
 */
function validarNotaDigitada(str) {
  if (str === null || str === undefined || str.trim() === "") {
    return { valido: true, valor: null };
  }
  const limpo = str.trim().replace(",", ".");
  const num = Number(limpo);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false, valor: null };
  }
  return { valido: true, valor: num };
}

/**
 * Valida a entrada do usuário ao editar faltas
 */
function validarFaltaDigitada(str) {
  if (str === null || str === undefined || str.trim() === "") {
    return { valido: false, valor: null };
  }
  const limpo = str.trim();
  if (!/^\d+$/.test(limpo)) {
    return { valido: false, valor: null };
  }
  const num = parseInt(limpo, 10);
  if (isNaN(num) || num < 0) {
    return { valido: false, valor: null };
  }
  return { valido: true, valor: num };
}

/**
 * Realiza o login na API com o PIN digitado
 */
async function fazerLogin() {
  const inputPin = document.getElementById("pin-input");
  const authStatus = document.getElementById("auth-status");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    authStatus.textContent = "Digite o PIN de acesso.";
    return;
  }

  authStatus.textContent = "Conectando...";

  try {
    const response = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (response.status === 401) {
      authStatus.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (response.status === 429) {
      authStatus.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!response.ok) {
      authStatus.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const json = await response.json();

    // PIN mantido somente em memória
    pinSessao = pinDigitado;
    inputPin.value = "";
    authStatus.textContent = "";

    // Se a API trouxe dados existentes, ela substitui totalmente os locais
    if (json.dados && Array.isArray(json.dados.disciplinas) && json.dados.disciplinas.length > 0) {
      dadosBoletim = json.dados.disciplinas;
    }

    document.getElementById("auth-section").style.display = "none";
    document.getElementById("boletim-content").style.display = "block";

    carregarBoletim();

  } catch (error) {
    authStatus.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

/**
 * Renderiza o boletim (tabela e cards)
 */
function carregarBoletim() {
  const corpoTabela = document.getElementById("tabela-corpo");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  dadosBoletim.forEach((item, index) => {
    // Trata notas (se vieram da API tratadas ou se usam fallback)
    const n1 = typeof item.tri1 === "number" ? item.tri1 : normalizarNota(item.tri1);
    const n2 = typeof item.tri2 === "number" ? item.tri2 : normalizarNota(item.tri2);
    const n3 = typeof item.tri3 === "number" ? item.tri3 : normalizarNota(item.tri3);

    // Média
    let somaNotas = 0;
    let qtdNotas = 0;
    if (n1 !== null) { somaNotas += n1; qtdNotas++; }
    if (n2 !== null) { somaNotas += n2; qtdNotas++; }
    if (n3 !== null) { somaNotas += n3; qtdNotas++; }

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

    // Faltas
    let arrFaltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltasDisc = arrFaltas.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    totalFaltasGeral += totalFaltasDisc;

    // Linha da tabela
    const tr = document.createElement("tr");

    if (modoEdicao) {
      const valF1 = arrFaltas[0] !== undefined ? arrFaltas[0] : 0;
      const valF2 = arrFaltas[1] !== undefined ? arrFaltas[1] : 0;
      const valF3 = arrFaltas[2] !== undefined ? arrFaltas[2] : 0;

      const valN1 = n1 !== null ? String(n1).replace(".", ",") : "";
      const valN2 = n2 !== null ? String(n2).replace(".", ",") : "";
      const valN3 = n3 !== null ? String(n3).replace(".", ",") : "";

      const tdNome = document.createElement("td");
      const strongNome = document.createElement("strong");
      strongNome.textContent = item.disciplina;
      tdNome.appendChild(strongNome);

      tr.appendChild(tdNome);
      tr.innerHTML += `
        <td><input type="text" id="edit-n1-${index}" value="${valN1}" placeholder="—"></td>
        <td><input type="text" id="edit-n2-${index}" value="${valN2}" placeholder="—"></td>
        <td><input type="text" id="edit-n3-${index}" value="${valN3}" placeholder="—"></td>
        <td><strong>${media !== null ? media.toFixed(1).replace(".", ",") : "—"}</strong></td>
        <td>
          <input type="text" id="edit-f1-${index}" value="${valF1}" style="width:35px">
          <input type="text" id="edit-f2-${index}" value="${valF2}" style="width:35px">
          <input type="text" id="edit-f3-${index}" value="${valF3}" style="width:35px">
        </td>
      `;

      const tdSit = document.createElement("td");
      const spanBadge = document.createElement("span");
      spanBadge.className = `badge ${situacaoClasse}`;
      spanBadge.textContent = situacaoTexto;
      tdSit.appendChild(spanBadge);
      tr.appendChild(tdSit);

    } else {
      const tdNome = document.createElement("td");
      const strongNome = document.createElement("strong");
      strongNome.textContent = item.disciplina;
      tdNome.appendChild(strongNome);

      tr.appendChild(tdNome);
      tr.innerHTML += `
        <td>${formatarExibicaoNota(n1)}</td>
        <td>${formatarExibicaoNota(n2)}</td>
        <td>${formatarExibicaoNota(n3)}</td>
        <td><strong>${media !== null ? media.toFixed(1).replace(".", ",") : "—"}</strong></td>
        <td>${totalFaltasDisc}</td>
      `;

      const tdSit = document.createElement("td");
      const spanBadge = document.createElement("span");
      spanBadge.className = `badge ${situacaoClasse}`;
      spanBadge.textContent = situacaoTexto;
      tdSit.appendChild(spanBadge);
      tr.appendChild(tdSit);
    }

    corpoTabela.appendChild(tr);
  });

  // Atualização dos Cards
  const mediaGeral = qtdDisciplinasComMedia > 0 ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") : "—";

  document.getElementById("card-media-geral").textContent = mediaGeral;
  document.getElementById("card-total-faltas").textContent = totalFaltasGeral;
  document.getElementById("card-bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("card-precisam-atencao").textContent = qtdAtencao;
}

/**
 * Alterna entre visualização e formulário de edição
 */
function alternarModoEdicao() {
  modoEdicao = !modoEdicao;
  const btnAlterar = document.getElementById("btn-alterar");
  const btnSalvar = document.getElementById("btn-salvar");
  const msgStatus = document.getElementById("mensagem-status");

  msgStatus.textContent = "";

  if (modoEdicao) {
    btnAlterar.textContent = "Cancelar edição";
    btnSalvar.style.display = "inline-block";
  } else {
    btnAlterar.textContent = "Alterar dados";
    btnSalvar.style.display = "none";
  }

  carregarBoletim();
}

/**
 * Envia as alterações para a API
 */
async function salvarDadosApi() {
  const msgStatus = document.getElementById("mensagem-status");
  let houverErro = false;

  const novasDisciplinas = [];

  for (let i = 0; i < dadosBoletim.length; i++) {
    const elN1 = document.getElementById(`edit-n1-${i}`);
    const elN2 = document.getElementById(`edit-n2-${i}`);
    const elN3 = document.getElementById(`edit-n3-${i}`);

    const elF1 = document.getElementById(`edit-f1-${i}`);
    const elF2 = document.getElementById(`edit-f2-${i}`);
    const elF3 = document.getElementById(`edit-f3-${i}`);

    // Limpa erros visuais anteriores
    [elN1, elN2, elN3, elF1, elF2, elF3].forEach(el => el && el.classList.remove("campo-invalido"));

    const vN1 = validarNotaDigitada(elN1.value);
    const vN2 = validarNotaDigitada(elN2.value);
    const vN3 = validarNotaDigitada(elN3.value);

    const vF1 = validarFaltaDigitada(elF1.value);
    const vF2 = validarFaltaDigitada(elF2.value);
    const vF3 = validarFaltaDigitada(elF3.value);

    if (!vN1.valido) { elN1.classList.add("campo-invalido"); houverErro = true; }
    if (!vN2.valido) { elN2.classList.add("campo-invalido"); houverErro = true; }
    if (!vN3.valido) { elN3.classList.add("campo-invalido"); houverErro = true; }

    if (!vF1.valido) { elF1.classList.add("campo-invalido"); houverErro = true; }
    if (!vF2.valido) { elF2.classList.add("campo-invalido"); houverErro = true; }
    if (!vF3.valido) { elF3.classList.add("campo-invalido"); houverErro = true; }

    novasDisciplinas.push({
      disciplina: dadosBoletim[i].disciplina,
      tri1: vN1.valor,
      tri2: vN2.valor,
      tri3: vN3.valor,
      faltas: [vF1.valor, vF2.valor, vF3.valor]
    });
  }

  if (houverErro) {
    msgStatus.textContent = "Verifique os campos destacados em vermelho.";
    return;
  }

  msgStatus.textContent = "Salvando...";

  try {
    const response = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!response.ok) {
      msgStatus.textContent = "Erro ao salvar na API. Tente novamente.";
      return;
    }

    dadosBoletim = novasDisciplinas;
    modoEdicao = false;

    document.getElementById("btn-alterar").textContent = "Alterar dados";
    document.getElementById("btn-salvar").style.display = "none";
    msgStatus.textContent = "Dados salvos com sucesso.";

    carregarBoletim();

  } catch (err) {
    msgStatus.textContent = "Erro de conexão ao salvar os dados.";
  }
}