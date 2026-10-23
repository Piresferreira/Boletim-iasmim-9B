<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boletim Digital</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Container principal do boletim -->
  <div class="container">
    
    <!-- Cabeçalho principal -->
    <header class="header">
      <h1>Boletim Digital</h1>
      <p class="subtitle">9º Ano • Estudante Exemplo</p>
    </header>

    <!-- Área de cards com resumo geral -->
    <section class="cards-grid">
      <div class="card card-media">
        <h3>Média Geral</h3>
        <p class="card-value" id="card-media-geral">--</p>
      </div>

      <div class="card card-faltas">
        <h3>Total de Faltas</h3>
        <p class="card-value" id="card-total-faltas">--</p>
      </div>

      <div class="card card-frequencia">
        <h3>Frequência Demonstrativa</h3>
        <p class="card-value" id="card-frequencia">92%</p>
        <span class="card-tag">Frequência adequada</span>
      </div>

      <div class="card card-bom-desempenho">
        <h3>Bom Desempenho</h3>
        <p class="card-value" id="card-bom-desempenho">--</p>
      </div>

      <div class="card card-atencao">
        <h3>Precisam de Atenção</h3>
        <p class="card-value" id="card-precisam-atencao">--</p>
      </div>
    </section>

    <!-- Tabela responsiva de disciplinas -->
    <section class="table-container">
      <table class="boletim-table">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th>1º Tri</th>
            <th>2º Tri</th>
            <th>3º Tri</th>
            <th>Média</th>
            <th>Faltas</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody id="tabela-corpo">
          <!-- As 15 linhas das disciplinas serão preenchidas dinamicamente pelo JavaScript -->
        </tbody>
      </table>
    </section>

  </div>

  <!-- Vinculando o arquivo de script JavaScript -->
  <script src="script.js"></script>
</body>
</html>