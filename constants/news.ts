// constants/news.ts

export type NewsSuspicion = '20' | '40' | 'Positive' | 'Counter';

export interface NewsHeadline {
    subject: string;
    suspicion: NewsSuspicion;
    pt: string;
    en: string;
}

export const NEWS: NewsHeadline[] = [
    // ── Suspicion 0–20 (Cultura / Economia) ─────────────────────────────────
    { subject: 'Cultura',  suspicion: '20', pt: 'Brasil no Oscar: convidados não conseguem visto de entrada', en: 'Brazil at the Oscars: guests unable to get entry visas' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Filme de terror sobre mula sem cabeça quer ser "cerebral" diz diretor', en: 'Horror film about the headless mule wants to be "cerebral", says director' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Filme sobre o romance homossexual entre um petista e um bolsonarista bate recordes', en: 'Film about gay romance between a Lula and Bolsonaro supporter breaks records' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Nova série "Cueca Dourada": Um suspense sobre onde está o dinheiro', en: 'New series "Golden Briefs": A thriller about where the money is' },
    { subject: 'Cultura',  suspicion: '20', pt: '"Já ir de ré", documentário pornô sobre Bozonaso no serviço militar', en: '"Already in Reverse", porno documentary about Bozonaso in military service' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Filme sobre a queda do Bozonaso bate recorde de bilheteria e de processos judiciais', en: "Film about Bozonaso's downfall breaks box office and lawsuit records" },
    { subject: 'Cultura',  suspicion: '20', pt: '"Agora é nossa vez" série baseada no meme Guiana Portuguesa estréia em canais de stream', en: '"Now It\'s Our Turn" series based on the Portuguese Guyana meme premieres on streaming' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Filme sobre a queda do Bozonaso bate recorde de bilheteria e de memes na rede', en: "Film about Bozonaso's downfall breaks box office and internet meme records" },
    { subject: 'Cultura',  suspicion: '20', pt: 'Novo hit de sofrência: "Seu amor é um boleto"', en: 'New heartbreak hit: "Your love is an unpaid bill"' },
    { subject: 'Cultura',  suspicion: '20', pt: '"AI de mim" conta a história de um flanelinha que se transforma em IA', en: '"AI of Me" tells the story of a parking tout who becomes an AI' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Filme sobre o ET de Varginha ganha prêmio internacional', en: 'Film about the Varginha ET wins international award' },
    { subject: 'Cultura',  suspicion: '20', pt: 'Comédia sobre Brasília "É rir pra não chorar" tem exibição proibida', en: 'Brasília comedy "Laugh So You Don\'t Cry" banned from screenings' },
    { subject: 'Economia', suspicion: '20', pt: 'Taxa de juros sobe de novo', en: 'Interest rates rise again' },
    { subject: 'Economia', suspicion: '20', pt: 'IBOVESPA não sobe mas também não cai', en: 'IBOVESPA neither rises nor falls' },
    { subject: 'Economia', suspicion: '20', pt: 'Gasolina sobe de novo: caminhoneiros protestam contra energia solar', en: 'Gas prices rise again: truckers protest solar energy' },
    { subject: 'Economia', suspicion: '20', pt: 'Pix anônimo proposto por deputados e traficantes', en: 'Anonymous Pix payments proposed by lawmakers and drug dealers' },
    { subject: 'Economia', suspicion: '20', pt: 'Selic continua alta e empresários dizem que o Brasil não tem jeito', en: 'Selic rate stays high and business leaders say Brazil is hopeless' },
    { subject: 'Economia', suspicion: '20', pt: 'Juros dos EUA mais alto que do Brasil pela primeira vez', en: "US interest rates surpass Brazil's for the first time" },
    { subject: 'Economia', suspicion: '20', pt: 'Preço da cebola faz dona de casa chorar', en: 'Onion prices bring housewives to tears' },
    { subject: 'Economia', suspicion: '20', pt: '"Imposto do Clique": Lulalelé quer cobrar dez centavos por cada postagem no Instagram', en: '"Click Tax": Lulalelé wants to charge ten cents per Instagram post' },
    { subject: 'Economia', suspicion: '20', pt: 'Bets passam a representar 10% do PIB', en: 'Sports betting now represents 10% of GDP' },

    // ── Suspicion 21–40 (Esporte / Cotidiano) ────────────────────────────────
    { subject: 'Esporte',   suspicion: '40', pt: '7 a 1 não foi nada: seleção teme fazer papelão na Copa', en: '7-1 was nothing: national team fears disaster at the World Cup' },
    { subject: 'Esporte',   suspicion: '40', pt: 'Feynar quer jogar mas o pai não deixa', en: "Feynar wants to play but his father won't allow it" },
    { subject: 'Esporte',   suspicion: '40', pt: 'Jogos do campeonato brasileiro tem 11 minutos de bola correndo, em média', en: 'Brazilian championship matches average just 11 minutes of actual play' },
    { subject: 'Esporte',   suspicion: '40', pt: 'Rodada 12 do brasileirão tem metade dos resultados alterados após processos', en: 'Round 12 of the Brasileirão has half its results reversed by lawsuits' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Segurança de condomínio fechado agride jardineiro', en: 'Gated community guard assaults gardener' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Socialite bate em faxineira que não a deixou furar a fila do supermercado', en: 'Socialite assaults cleaner who blocked her from cutting the supermarket queue' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Novo restaurante de Apala tem prato com lágrimas do sous-chef', en: "Apala's new restaurant features a dish made with the sous-chef's tears" },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Influencer infantil entra com Porsche na Lagoa Rodrigo de Freitas', en: 'Child influencer drives Porsche into Lagoa Rodrigo de Freitas' },
    { subject: 'Ciência',   suspicion: '40', pt: 'Estudo da Unicamp mostra baixa de QI de até 30% ao assistir BBB', en: 'Unicamp study shows up to 30% IQ drop from watching Big Brother Brasil' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Dancinha de rede social viraliza no congresso', en: 'Social media dance goes viral in Congress' },
    { subject: 'Cotidiano', suspicion: '40', pt: '"Mais soja mais boi mais grana" agro lidera crescimento econômico', en: '"More soy, more cattle, more cash": agribusiness leads economic growth' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Trump diz que guerra entretem as pessoas e só morrem otários', en: 'Trump says war keeps people entertained and only idiots die' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Trump diz que é maior que Napoleão e adota o chapéu', en: 'Trump says he\'s greater than Napoleon and adopts the hat' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'União Européia abre comissão para discutir efeitos da internet', en: 'European Union opens commission to discuss the effects of the internet' },
    { subject: 'Cotidiano', suspicion: '40', pt: 'Seleções africanas não consguem visto para jogar a Copa nos EUA', en: 'African national teams unable to get visas to play the World Cup in the US' },

    // ── High suspicion > 40 (Meister investigation) ──────────────────────────
    { subject: 'Meister', suspicion: 'Positive', pt: 'PF investiga movimentações do Banco Meister', en: 'Federal Police investigates Banco Meister transactions' },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Conexões a políticos e crime no Banco Meister', en: 'Political and criminal ties uncovered at Banco Meister' },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Laranjas e malas de dinheiro: cerco aperta em torno de Vicaro', en: 'Front men and cash bags: net closes around Vicaro' },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Juízes do Supremo pegam carona em jatinho de Vicaro', en: "Supreme Court justices caught riding Vicaro's private jet" },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Lavando dinheiro para o PCC, por dentro do Meister', en: 'Laundering PCC money from inside the Meister' },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Esposa de juiz tem contrato de 100 milhões com Meister', en: "Judge's wife holds R$100 million contract with Meister" },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Centenas de empréstimos pessoais irregulares no Meister', en: 'Hundreds of irregular personal loans found at Meister' },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Cessão de Crédito do Meister será revertida pelo BC', en: "Meister's credit assignment to be reversed by Central Bank" },
    { subject: 'Meister', suspicion: 'Positive', pt: '"Vicaro comprou todo mundo" diz promotor', en: '"Vicaro bought everyone off", says prosecutor' },
    { subject: 'Meister', suspicion: 'Positive', pt: 'Vazam conversas de Vicaro com PCC', en: 'Chats between Vicaro and PCC leaked' },

    // ── Counter action (suspicion lowered this week) ──────────────────────────
    { subject: 'Meister', suspicion: 'Counter', pt: 'Investigador do Banco Central desaparece', en: 'Central Bank investigator goes missing' },
    { subject: 'Meister', suspicion: 'Counter', pt: 'Juíz do Supremo impõe sigilo na investigação sobre o Meister', en: 'Supreme Court justice seals investigation into Meister' },
    { subject: 'Meister', suspicion: 'Counter', pt: 'Deputados fazem votação extraordinária no sábado e votam contra CPI do Meister', en: 'Deputies hold emergency Saturday vote and block Meister parliamentary inquiry' },
];

export function pickHeadline(suspicion: number, counterThisWeek: boolean, levelIdx: number): NewsHeadline {
    if (counterThisWeek) {
        const candidates = NEWS.filter(h => h.suspicion === 'Counter');
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    // At level 1+, suspicion >= 30: 50% chance to pull a Meister headline
    if (levelIdx >= 1 && suspicion >= 30 && Math.random() < 0.5) {
        const candidates = NEWS.filter(h => h.suspicion === 'Positive');
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    const pool: NewsSuspicion = suspicion <= 20 ? '20' : suspicion <= 40 ? '40' : 'Positive';
    const candidates = NEWS.filter(h => h.suspicion === pool);
    return candidates[Math.floor(Math.random() * candidates.length)];
}
