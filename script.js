/* ==========================================
   1. CONFIGURAÇÕES INICIAIS & CARRINHO
   ========================================== */
let cart = [];
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');

// Elementos de Valor
const subtotalDisplay = document.getElementById('cart-subtotal');
const shippingDisplay = document.getElementById('cart-shipping-cost');
const totalValueDisplay = document.getElementById('cart-total-value');

// Abrir e Fechar Sacola
cartIcon.onclick = () => cartSidebar.classList.add('active');
closeCart.onclick = () => cartSidebar.classList.remove('active');

/* ==========================================
   2. LÓGICA DO CARRINHO (COMPRAS)
   ========================================== */

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('buy-btn') || e.target.closest('.promo-buy-btn') || e.target.closest('.pres-buy-btn')) {
        e.preventDefault();
        
        let card = e.target.closest('.product-card') || 
                   e.target.closest('.promo-wrapper') || 
                   e.target.closest('.presente-wrapper');

        // PEGA APENAS O NOME DO PRODUTO
        const nomeProduto = card.querySelector('h3, .promo-title, .pres-title').innerText.trim();
        
        // BUSCA O PREÇO NA LISTA DO ARQUIVO DE SEGURANÇA (IGNORA A TELA)
        const precoProtegido = obterPrecoReal(nomeProduto);

        const product = {
            id: Date.now(),
            name: nomeProduto,
            // Formata o preço para aparecer bonito no carrinho
            price: `R$ ${precoProtegido.toLocaleString('pt-br', {minimumFractionDigits: 2})}`,
            image: card.querySelector('img').src
        };
        
        addToCart(product);
    }
});

function addToCart(product) {
    cart.push(product);
    updateCart();
    cartSidebar.classList.add('active');
}

function updateCart() {
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const priceValue = parseFloat(item.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        subtotal += priceValue;

        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price}</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
        `;
    });

    cartCount.innerText = cart.length;
    
    // Atualiza o Subtotal na tela
    if(subtotalDisplay) subtotalDisplay.innerText = `R$ ${subtotal.toLocaleString('pt-br', {minimumFractionDigits: 2})}`;
    
    // Recalcula o Total (Subtotal + Frete que já estiver lá)
    atualizarTotalFinal();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg" style="text-align:center; padding:20px;">Sua sacola está vazia.</p>';
        if(shippingDisplay) shippingDisplay.innerText = "R$ 0,00";
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function atualizarTotalFinal() {
    const sub = parseFloat(subtotalDisplay.innerText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
    const frete = parseFloat(shippingDisplay.innerText.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
    const total = sub + frete;
    totalValueDisplay.innerText = `R$ ${total.toLocaleString('pt-br', {minimumFractionDigits: 2})}`;
}

/* ==========================================
   3. FRETE & LOGÍSTICA (CORRIGIDO)
   ========================================== */

async function calcularFreteDinamico() {
    const campoCep = document.getElementById('cart-cep');
    const msgStatus = document.getElementById('msg-logistica');
    const cep = campoCep.value.trim().replace(/\D/g, ''); // Remove tudo que não é número

    if (cep.length !== 8) {
        msgStatus.innerHTML = "<small style='color:#f8c2dd'>Digite os 8 números do CEP</small>";
        return;
    }

    msgStatus.innerHTML = "<small style='color: #ddd;'>Buscando endereço...</small>";

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            msgStatus.innerHTML = "<small style='color:#ff4d4d'>CEP não encontrado!</small>";
            return;
        }

        // 1. Mostrar Endereço e Abrir Campos de Número/Complemento
        msgStatus.innerHTML = `
            <div style="text-align: left; margin-top: 8px; line-height: 1.4; background: rgba(255,255,255,0.1); padding: 12px; border-radius: 4px;">
                <strong style="color: #27ae60; font-size: 10px; text-transform: uppercase;">🚚 Entregar em:</strong><br>
                <span style="color: #fff; font-size: 11px;">
                    ${dados.logradouro}, ${dados.bairro}<br>
                    ${dados.localidade}/${dados.uf}
                </span>
                
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <input type="text" id="end-numero" placeholder="Nº" style="width: 30%; padding: 5px; font-size: 11px; border-radius: 3px; border: 1px solid #f8c2dd; background: #fff; color: #3d1111;">
                    <input type="text" id="end-compl" placeholder="Complemento" style="width: 70%; padding: 5px; font-size: 11px; border-radius: 3px; border: 1px solid #f8c2dd; background: #fff; color: #3d1111;">
                </div>
            </div>
        `;

        // Coloca o cursor automaticamente no número (Melhora a UX!)
        setTimeout(() => document.getElementById('end-numero').focus(), 100);

        // 2. Calcular Valor do Frete (Sua lógica original)
        let valorFrete = (dados.uf === "SP") ? 15.00 : 25.00;
        if (cart.length > 2) valorFrete += 10.00;

        shippingDisplay.innerText = `R$ ${valorFrete.toLocaleString('pt-br', {minimumFractionDigits: 2})}`;
        
        // 3. Atualizar o Total Geral
        atualizarTotalFinal();

    } catch (erro) {
        msgStatus.innerHTML = "<small style='color:#ff4d4d'>Erro ao calcular. Tente novamente.</small>";
    }
}
/* ==========================================
   4. FINALIZAÇÃO E MENSAGEM DE SUCESSO
   ========================================== */

function irParaPagamento() {
    // 1. Verifica se tem itens
    if (cart.length === 0) {
        alert("Sua sacola está vazia!");
        return;
    }

    // 2. Pega os valores da tela (garante que o frete está somado)
    const valorTotal = totalValueDisplay.innerText;
    const freteTexto = shippingDisplay ? shippingDisplay.innerText : "R$ 0,00";
    const valorFreteNum = parseFloat(freteTexto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;

    // 3. Mensagem de Confirmação
    alert(`Redirecionando para o PagSeguro...\nValor Total: ${valorTotal}`);

    // 4. Monta a URL (IMPORTANTE: Troque pelo seu e-mail real)
    const emailPagSeguro = "seu-email@exemplo.com"; 
    let url = `https://pagseguro.uol.com.br/v2/checkout/payment.html?receiverEmail=${emailPagSeguro}&currency=BRL`;
    
    // Adiciona os produtos
    cart.forEach((item, index) => {
        let i = index + 1;
        let precoLimpo = item.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        let valorFinal = parseFloat(precoLimpo).toFixed(2);

        url += `&itemId${i}=${i}`;
        url += `&itemDescription${i}=${encodeURIComponent(item.name)}`;
        url += `&itemAmount${i}=${valorFinal}`;
        url += `&itemQuantity${i}=1`;
    });

    // Adiciona o Frete se ele existir
    if (valorFreteNum > 0) {
        url += `&shippingCost=${valorFreteNum.toFixed(2)}`;
    }

    // 5. Redireciona de forma forçada
    console.log("URL de Pagamento:", url); // Para você testar no F12 se quiser
    window.location.assign(url); 
}

/* ==========================================
   5. INTERFACE (MENU & BUSCA)
   ========================================== */
/* ==========================================
   5. INTERFACE (MENU, BUSCA E CARROSSEL)
   ========================================== */

// --- CARROSSEL COMPLETO (AUTOMÁTICO + SETAS) ---
let slideIndex = 1;
const slides = document.getElementsByClassName("my-slide");

// Inicia o carrossel se houver imagens
if (slides.length > 0) {
    showSlides(slideIndex);
    
    // Roda sozinho a cada 5 segundos
    setInterval(() => {
        plusSlides(1);
    }, 5000);
}

// Função para as setinhas (Avançar/Voltar)
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Função principal de exibição
function showSlides(n) {
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    
    // Esconde todas as imagens
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    // Mostra apenas a imagem atual
    slides[slideIndex - 1].style.display = "block";
}

// --- BUSCA DE PRODUTOS ---
document.getElementById('search-input').addEventListener('keyup', function() {
    let filter = this.value.toLowerCase();
    let cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        let name = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = name.includes(filter) ? "flex" : "none";
    });
});

// --- MENU MOBILE ---
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-list');

if (menuToggle) {
    menuToggle.onclick = () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    };
}

// PAG SEGURO FINAL //
function irParaPagamento() {
    const modal = document.getElementById('modal-checkout');
    const titulo = document.getElementById('modal-titulo');
    const texto = document.getElementById('modal-texto');
    const icone = document.getElementById('modal-icon');

    // 1. Validação de Sacola Vazia
    if (cart.length === 0) {
        exibirStatus("Atenção!", "Sua sacola está vazia. Adicione um perfume antes de finalizar.", "⚠️");
        return;
    }

    // 2. Validação de Endereço (O que acabamos de fazer!)
    const num = document.getElementById('end-numero')?.value;
    if (!num) {
        exibirStatus("Quase lá!", "Por favor, preencha o número da residência para a entrega.", "📍");
        document.getElementById('end-numero')?.focus();
        return;
    }

    // 3. Simulação de Sucesso 
    exibirStatus(
        "Pedido Enviado!", 
        "Integração com PagSeguro ativa. Em um cenário real, você seria redirecionado agora para o pagamento seguro. <br><br> <strong>Total: " + totalValueDisplay.innerText + "</strong>", 
        "✅"
    );

    // Opcional: Limpar carrinho após o "sucesso"
    // cart = [];
    // updateCart();
}

function exibirStatus(tit, txt, icon) {
    const modal = document.getElementById('modal-checkout');
    document.getElementById('modal-titulo').innerText = tit;
    document.getElementById('modal-texto').innerHTML = txt;
    document.getElementById('modal-icon').innerText = icon;
    modal.style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-checkout').style.display = 'none';
}