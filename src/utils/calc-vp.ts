/*
    Esta fórmula calcula o "VALOR PRESENTE" (VP) de uma parcela, ou seja,
    saber o valor da parcela para amortização (pagamento antecipado)

    Valor Presente = Valor Futuro / (1 + taxa) ^ período
    VP = VF / (1 + TX) ^ P

    Onde:
    - VP → O valor que queremos encontrar, quando custará uma parcela futura se eu pagar antecipado
    - VF → Valor real da parcela (sem juros) se for paga dentro do prazo esperado
    - TX → taxa de juros mensal (ex: 10.45 aa = 10.45 / 12)
    - P → representa o número de meses até o recebimento do valor - exemplo: esperei 2 anos para pagar a parcela nº 50
    então é 50 - 24 = 26. Então estou antecipando 26 meses desta parcela.
  * */

export function calcVP(
  installmentNumber: number,
  monthlyFee: number,
  rawInstallment: number,

  // número de meses que já se passaram sem pagar essa parcela
  // ex: vou esperar 2 anos para pagar, então aqui será 24 meses.
  deductedMonths: number,
) {
  // quanto falta para chegar nessa parcela, exemplo: esperei 2 anos para pagar a parcela nº 50
  // então é 50 - 24 = 26. Então estou antecipando 26 meses desta parcela.
  const dueDate = installmentNumber - deductedMonths;
  const vp = rawInstallment / Math.pow(1 + monthlyFee, dueDate)

  return {
    vp,
    dueDate
  }
}
