const jogo = {
  baralho: [],
  pilhas: [-1, -1, -1, -1, -1, -1, -1],
  fundacao: [-1, -1, -1, -1],
  estoque: [],
  descarte: [],

  // Cria os elementos visuais do jogo
  criar_carta(index) {
    // Cria um novo elemento
    const carta = document.createElement("div");
    // Adiciona o estilo da carta
    carta.classList.add("carta");
    // Cria o identificador da carta de acordo com a posição no array do baralho
    carta.id = index;
    // Adiciona os atributos de exibição da carta
    carta.setAttribute("data-cor", this.baralho[index].naipe.cor);
    carta.setAttribute("data-carta", this.baralho[index].nome);
    carta.setAttribute("data-naipe", this.baralho[index].naipe.emoji);

    // Desabilita a função de movimentação da carta
    carta.draggable = false;
    // Permite que outras cartas sejam arrastadas até ela
    carta.allowDrop = true;
    // Adiciona as funções de validação
    carta.ondragstart = drag;
    carta.ondragover = allowDrop;
    carta.ondrop = drop;

    // Adiciona eventos de toque para dispositivos móveis
    carta.addEventListener("touchstart", touchStart, false);
    carta.addEventListener("touchmove", touchMove, false);
    carta.addEventListener("touchend", touchEnd, false);

    // Adiciona a classe de cor com base no naipe
    if (this.baralho[index].naipe.cor === "red") {
      carta.classList.add("carta-vermelha");
    } else {
      carta.classList.add("carta-preta");
    }
    
    // Adiciona a imagem do naipe, mas a esconde inicialmente
    const imagem = document.createElement("img");
    imagem.classList.add("naipe-imagem");
    imagem.setAttribute("src", this.baralho[index].naipe.imagensNipes);
    imagem.style.display = 'none'; // Esconde a imagem inicialmente
    carta.appendChild(imagem);

    // Adiciona a carta inicialmente à pilha de estoque
    this.estoque.push(index);
    document.getElementById("estoque").appendChild(carta);
  },

  // Adiciona o CSS que permitirá que a carta seja vista pelo jogador
  virar_carta(index, estoque = false) {
    // Pega o elemento
    let carta = document.getElementById(index);
    // Adiciona o CSS à carta
    carta.classList.add("carta-virada");
    // Habilita a movimentação da carta
    carta.draggable = true;

    // Exibe a imagem do naipe
    const imagem = carta.querySelector(".naipe-imagem");
    if (imagem) {
      //imagem.style.display = 'block';
      imagem.style.display = 'none';
    }

    // Se a carta estiver no estoque, move para a pilha de descarte.
    if (estoque) {
      document.getElementById("descarte").appendChild(carta);
    }
  },

  // Move as cartas da pilha de descarte para a pilha de estoque
  reset_pilha_estoque() {
    // Faz a troca das pilhas
    this.estoque = this.descarte;
    // Inverte as cartas
    this.estoque.reverse();
    this.descarte = [];

    // Oculta as cartas novamente, fazendo o inverso da função virar_carta
    for (let i = 0; i < this.estoque.length; i++) {
      let carta = document.getElementById(this.estoque[i]);
      carta.classList.remove("carta-virada");
      carta.draggable = false;

      // Esconde a imagem do naipe ao mover de volta para o estoque
      const imagem = carta.querySelector(".naipe-imagem");
      if (imagem) {
        imagem.style.display = 'none';
      }

      document.getElementById("estoque").appendChild(carta);
    }
  },

  // Função chamada ao clicar na pilha de estoque
  descartar_carta() {
      // Verifica se possui cartas no estoque
      if (this.estoque.length > 0) {
          // Move até três cartas para a pilha de descarte
          for (let i = 0; i < 3 && this.estoque.length > 0; i++) {
              let ultima_carta_estoque = this.estoque.splice(-1, 1);
              this.descarte.push(ultima_carta_estoque);
              ultima_carta_estoque = parseInt(ultima_carta_estoque);

              this.virar_carta(ultima_carta_estoque, true);
          }
      // Caso não tenha mais cartas, pega novamente as cartas do descarte
      } else if (this.descarte.length > 0) {
          this.reset_pilha_estoque();
      }
  }
}

// Evento chamado ao iniciar o movimento de uma carta
function drag(ev) {
    // Verifica se a carta está sendo arrastada da área de estoque
    if (ev.target.parentElement.id === "estoque") {
        ev.preventDefault();
        return;
    }
    // Guarda o id do elemento que está sendo movido
    ev.dataTransfer.setData("carta", ev.target.id);
}

// Desabilita a função padrão ao movimentar uma carta
function allowDrop(ev) {
  ev.preventDefault();
}

// Evento chamado ao soltar uma carta sobre a outra
function drop(ev) {
    ev.preventDefault();

    // Pega os ids de origem e destino para validação da jogada
    var origem = parseInt(ev.dataTransfer.getData("carta"));
    var destino = parseInt(ev.target.id);

    // Verifica se a pilha de destino é a área de estoque
    if (ev.target.id === "estoque" || ev.target.parentElement.id === "estoque") {
        return; // Impede que as cartas sejam soltas na área de estoque
    }

    // Verifica se a pilha de destino está vazia
    if (!jogo.baralho[destino]) {
        // Verifica se a carta é o Rei (K = 13) e se a pilha de destino não é a pilha de fundação
        if (jogo.baralho[origem].carta != 13 && ev.target.classList.contains("pilha")) {
            return;
        }

        // Verifica se a carta é o Ás (A = 1) e se a pilha de destino é a pilha de fundação
        if (jogo.baralho[origem].carta != 1 && ev.target.classList.contains("pilha_fundacao")) {
            return;
        }

        // Retira da pilha atual
        if (jogo.baralho[origem].pai != -1) {
            jogo.baralho[jogo.baralho[origem].pai].filho = -1;

            // Adiciona o CSS da carta virada ao elemento pai
            let elemento_pai = document.getElementById(jogo.baralho[origem].pai);
            if (!elemento_pai.classList.contains("carta-virada"))
                jogo.virar_carta(jogo.baralho[origem].pai);
        }

        // Verifica se a carta de origem está na pilha de descarte
        if (document.querySelector(`.pilha_descarte [data-carta="${jogo.baralho[origem].nome}"][data-naipe="${jogo.baralho[origem].naipe.emoji}"]`)) {
            // Remove da pilha de descarte
            jogo.descarte.splice(-1, 1);
        }

        // Move o elemento para o destino
        ev.target.appendChild(document.getElementById(origem));

    // Verifica se é o final da pilha
    } else if (jogo.baralho[destino].filho == -1) {
        // Verifica se a carta de destino está na pilha de descarte
        if (document.querySelector(`.pilha_descarte [data-carta="${jogo.baralho[destino].nome}"][data-naipe="${jogo.baralho[destino].naipe.emoji}"]`)) {
            return;
        }

        // Verifica se a carta de destino está fora da pilha de fundação
        if (document.querySelector(`.pilha [data-carta="${jogo.baralho[destino].nome}"][data-naipe="${jogo.baralho[destino].naipe.emoji}"]`)) {
            // Verifica se a carta destino é maior que a carta de origem
            if (jogo.baralho[destino].carta != jogo.baralho[origem].carta + 1) {
                return;
            }

            // Verifica a cor das cartas
            if (jogo.baralho[destino].naipe.cor == jogo.baralho[origem].naipe.cor) {
                return;
            }
        // Verifica se a carta de destino está na pilha de fundação
        } else if (document.querySelector(`.pilha_fundacao [data-carta="${jogo.baralho[destino].nome}"][data-naipe="${jogo.baralho[destino].naipe.emoji}"]`)) {
            // Verifica se a carta destino é menor que a carta de origem
            if (jogo.baralho[destino].carta != jogo.baralho[origem].carta - 1) {
                return;
            }

            // Verifica o naipe das cartas
            if (jogo.baralho[destino].naipe.nome != jogo.baralho[origem].naipe.nome) {
                return;
            }
        }

        // Caso esteja tudo ok com a jogada, realiza o movimento

        // Remove o encadeamento com a carta pai (caso haja)
        if (jogo.baralho[origem].pai != -1) {
            jogo.baralho[jogo.baralho[origem].pai].filho = -1;

            // Caso a carta pai esteja oculta, adiciona o CSS da carta virada ao elemento pai
            let elemento_pai = document.getElementById(jogo.baralho[origem].pai);
            if (!elemento_pai.classList.contains("carta-virada"))
                jogo.virar_carta(jogo.baralho[origem].pai);
        }
        // Coloca na pilha destino
        jogo.baralho[origem].pai = destino;
        jogo.baralho[destino].filho = origem;

        // Verifica se a carta de origem está na pilha de descarte
        if (document.querySelector(`.pilha_descarte [data-carta="${jogo.baralho[origem].nome}"][data-naipe="${jogo.baralho[origem].naipe.emoji}"]`)) {
            // Remove da pilha de descarte
            jogo.descarte.splice(-1, 1);
        }

        // Move o elemento para o destino
        ev.target.appendChild(document.getElementById(origem));

        // Verifica se é o fim do jogo
        let qtd_cartas_fundacao = document.querySelectorAll(".fundacoes .carta");
        if (qtd_cartas_fundacao.length == jogo.baralho.length) {
            // Exibe mensagem de parabéns e inicia um novo jogo (atualiza a tela)
            if (confirm("Parabéns, você ganhou o jogo!")) {
                window.location.reload();
            }
        }
    }
}

// Variáveis para armazenar o estado do toque
let touchStartX = 0;
let touchStartY = 0;
let touchElement = null;

// Função chamada ao iniciar o toque
function touchStart(ev) {
  touchStartX = ev.touches[0].clientX;
  touchStartY = ev.touches[0].clientY;
  touchElement = ev.target;

  // Verifica se a carta está virada para cima antes de permitir o movimento
  if (!touchElement.classList.contains("carta-virada")) {
    touchElement = null;
  }
}

// Função chamada ao mover o toque
function touchMove(ev) {
  if (!touchElement) return;

  ev.preventDefault();
  const touchMoveX = ev.touches[0].clientX;
  const touchMoveY = ev.touches[0].clientY;

  const deltaX = touchMoveX - touchStartX;
  const deltaY = touchMoveY - touchStartY;

  touchElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

// Função chamada ao finalizar o toque
function touchEnd(ev) {
  if (!touchElement) return;

  ev.preventDefault();
  touchElement.style.transform = '';

  const touchEndX = ev.changedTouches[0].clientX;
  const touchEndY = ev.changedTouches[0].clientY;

  const dropElement = document.elementFromPoint(touchEndX, touchEndY);

  if (dropElement && dropElement.ondrop) {
    const event = new Event('drop', { bubbles: true });
    event.dataTransfer = {
      getData: () => touchElement.id
    };
    dropElement.dispatchEvent(event);
  }
}

function main() {
  // Cria e embaralha as cartas
  jogo.baralho = embaralhar(criar_baralho());

  // Cria os elementos visuais do baralho
  for (let index in jogo.baralho)
    jogo.criar_carta(index);

  /*
      Inicialmente, todas as cartas vão para o estoque.
      Para iniciar o jogo, as cartas de cima da pilha do estoque são movidas para as pilhas de carta do jogo,
      começando com 1 carta na primeira pilha, 2 na segunda, 3 na terceira e assim por diante até a 7ª pilha.
  */
  // Variável auxiliar contendo a posição do array na pilha de estoque
  var aux = jogo.baralho.length - 1;
  // Percorre as 7 pilhas de montagem de cartas
  for (var i = 0; i < 7; i++) {
    // Variável auxiliar contendo o id do elemento html da pilha
    let aux2 = `pilha${i + 1}`;
    // Adiciona a quantidade certa de carta para cada pilha
    for (var j = 1; j <= i + 1; j++) {
      // Move o elemento do estoque para a pilha atual
      document.getElementById(aux2).appendChild(document.getElementById(aux));

      // Verifica se é a primeira carta da pilha, que deverá ser setada sem nenhum elemento pai e filho
      if (j == 1) {
        jogo.baralho[aux].pai = -1;
        jogo.baralho[aux].filho = -1;
      // Caso não seja, faz o relacionamento da carta atual com a carta anterior para que tenhamos uma lista
      // duplamente encadeada
      } else {
        jogo.baralho[aux].pai = aux + 1;
        jogo.baralho[aux + 1].filho = aux;
      }

      // Se for a última carta da pilha, vira a carta, caso contrário a carta deverá permanecer oculta para o jogador.
      if (j == i + 1) {
        jogo.virar_carta(aux);
      }

      // Remove a carta da pilha do estoque
      jogo.estoque.splice(aux, 1);

      // Atualiza as variáveis de controle
      aux2 = aux;
      aux--;
    }
  }
}



// Adiciona evento de toque na área de estoque
document.getElementById("estoque").addEventListener("touchstart", function() {
  jogo.descartar_carta();
}, false);

main();