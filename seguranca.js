// LISTA DE PREÇOS OFICIAIS (O sistema só confia nisso aqui)
const PRECOS_OFICIAIS = {
    "Dalal": 289.90,
    "Asad Bourbon": 195.00,
    "Asad Preto": 195.00,
    "Asad Elixir": 195.00,
    "Champion Sugar": 195.00,
    "Champion Money": 195.00,
    "Attar Al Wasal": 195.00,
    "Asad Bourbon Special": 389.90,
    "Al Wataniah Ameeratil": 310.00,
    "Lattafa Yara Rosa": 310.00,
    "Lattafa Yara Amarelo": 310.00,
    "Rosa Angelical": 310.00,
    "Layaan": 289.90,
    "Kit Queridinhos - Seraphim": 459.90
};

// Trava de Teclado e Mouse
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74))) return false;
};

// Função que o outro arquivo vai usar para saber o preço
function obterPrecoReal(nome) {
    return PRECOS_OFICIAIS[nome] || 0;
}
// TRAVA ANTI-F12 E ANTI-CLIQUE DIREITO
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = function(e) {
    if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74))) {
        return false;
    }
};

// FUNÇÃO QUE CONFERE O PREÇO REAL
function obterPrecoSeguro(nomeProduto) {
    return PRECOS_OFICIAIS[nomeProduto] || 0;
}