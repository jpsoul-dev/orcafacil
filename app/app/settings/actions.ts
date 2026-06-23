'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const settingsSchema = z.object({
  name: z.string().min(1, 'Nome do negócio é obrigatório'),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  cnpj: z.string().optional().nullable(),
  address_zip: z.string().optional().nullable(),
  address_street: z.string().optional().nullable(),
  address_number: z.string().optional().nullable(),
  address_complement: z.string().optional().nullable(),
  address_neighborhood: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_state: z.string().optional().nullable(),
  show_quote_number: z.boolean().optional().default(true),
})

export async function saveCompanySettings(formData: FormData) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const rawData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      whatsapp: formData.get('whatsapp') as string,
      email: formData.get('email') as string,
      cnpj: formData.get('cnpj') as string,
      address_zip: formData.get('address_zip') as string,
      address_street: formData.get('address_street') as string,
      address_number: formData.get('address_number') as string,
      address_complement: formData.get('address_complement') as string,
      address_neighborhood: formData.get('address_neighborhood') as string,
      address_city: formData.get('address_city') as string,
      address_state: formData.get('address_state') as string,
      show_quote_number: formData.get('show_quote_number') === 'true',
    }

    const validation = settingsSchema.safeParse(rawData)
    if (!validation.success) {
      return { success: false, error: 'Dados das configurações inválidos' }
    }

    const validatedData = validation.data

    let logoUrl = undefined
    const logoFile = formData.get('logo') as File | null
    const removeLogo = formData.get('remove_logo') === 'true'

    if (logoFile && logoFile.size > 0) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
      if (!validTypes.includes(logoFile.type)) {
        return { success: false, error: 'Formato de imagem inválido. Use PNG, JPG, WEBP ou SVG.' }
      }
      if (logoFile.size > 2 * 1024 * 1024) {
        return { success: false, error: 'O tamanho da imagem não deve exceder 2MB.' }
      }

      const ext = logoFile.name.split('.').pop() || 'png'
      const filePath = `${user.id}/logo-${Date.now()}.${ext}`

      const arrayBuffer = await logoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, buffer, {
          contentType: logoFile.type,
          upsert: true,
        })

      if (uploadError) {
        logger.error('Error uploading logo:', uploadError)
        return { success: false, error: 'Erro ao fazer upload do logotipo.' }
      }

      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath)

      logoUrl = publicUrlData.publicUrl
    }

    const companyData: any = {
      user_id: user.id,
      ...validatedData,
    }

    if (logoUrl) {
      companyData.logo_url = logoUrl
    } else if (removeLogo) {
      companyData.logo_url = null
    }

    // Check if company exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingCompany) {
      const { error: updateError } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', existingCompany.id)
      if (updateError) {
        return { success: false, error: updateError.message }
      }
    } else {
      const { error: insertError } = await supabase
        .from('companies')
        .insert(companyData)
      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    revalidatePath('/app/settings')
    return { success: true }
  } catch (error) {
    logger.error('Error in saveCompanySettings:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao salvar as configurações.',
    }
  }
}
