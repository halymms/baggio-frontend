export default function Layout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}


// - DADOS APRESENTADOS COM FILTRO DE MÊS A MÊS (Ativos) -/
// Garantia - pizza com os tipos de garantia - OK
// Seguradora - pizza com os tipos de seguradora
// FCI % - Pizza com quais imóveis tem e não tem FCI - OK
// Data ultimo reajuste - Gráfico de Linha  - Quantos imóveis reajustaram em cada mês - OK
// Bairro do imóvel - Coluna  - com a proporção dos 8 bairros com mais imóveis.
// Cidade - com a proporção dos 5 bairros com mais imóveis.
// Tipo - pizza com os tipos de imóvel - OK
// Imóvel Residencial ou comercial - pizza - OK

// - RESCINDIDOS -
// Motivo da Rescisão - Coluna com os motivos 
// Carteira em %  - Esse entra como card no dados básicos de locação
// Garantia dos Rescindidos - pizza - Esse é a coluna de garantia com filtro de status como rescindido.

// - BAIXADOS -
// Status - Pizza por status
// Motivo - Coluna com os motivos
// Tipo da Angariação - coluna com os tipos
// Publicações - Pizza com os canais de publicação
// Data da Baixa - Gráfico de Linha - Quantos imóveis reajustaram em cada mês