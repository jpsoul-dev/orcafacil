export const maskCPF = (value: string) => {
  value = value.replace(/\D/g, '')
  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export const maskCNPJ = (value: string) => {
  value = value.replace(/\D/g, '')
  return value
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

export const maskCNPJAlphanumeric = (value: string) => {
  // Remove tudo que não for letra ou número
  value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  
  // Estrutura: AA.AAA.AAA/AAAA-DV
  // Onde DV são números (mas na máscara permitimos digitar)
  
  return value
    .replace(/^([A-Z0-9]{2})([A-Z0-9])/, '$1.$2')
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, '$1.$2.$3')
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})\.([A-Z0-9]{3})([A-Z0-9])/, '$1.$2.$3/$4')
    .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})\.([A-Z0-9]{3})\/([A-Z0-9]{4})([A-Z0-9])/, '$1.$2.$3/$4-$5')
    .replace(/^(.{2}\..{3}\..{3}\/.{4}-.{2}).+$/, '$1') // Limita tamanho
}

export const maskCPFCNPJ = (value: string) => {
  value = value.replace(/\D/g, '')
  if (value.length <= 11) {
    return maskCPF(value)
  } else {
    return maskCNPJ(value)
  }
}

export const maskPhone = (value: string) => {
  if (!value) return ''
  value = value.replace(/\D/g, '')
  if (value.length <= 10) {
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  } else {
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }
}

export const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

export const maskCurrency = (value: string) => {
  if (!value) return ''
  const cleanValue = value.toString().replace(/\D/g, '')
  const options = { minimumFractionDigits: 2 }
  const result = new Intl.NumberFormat('pt-BR', options).format(
    parseFloat(cleanValue) / 100
  )
  return result
}
