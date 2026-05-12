'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCompanySettings(formData: FormData) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address_zip = formData.get('address_zip') as string
    const address_street = formData.get('address_street') as string
    const address_number = formData.get('address_number') as string
    const address_complement = formData.get('address_complement') as string
    const address_neighborhood = formData.get('address_neighborhood') as string
    const address_city = formData.get('address_city') as string
    const address_state = formData.get('address_state') as string
    const logoFile = formData.get('logo') as File | null

    let logo_url = formData.get('existing_logo_url') as string

    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, logoFile, { upsert: true })

      if (uploadError) {
        return { success: false, error: 'Falha ao fazer upload da logo' }
      }

      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath)

      logo_url = publicUrlData.publicUrl
    }

    const companyData = {
      user_id: user.id,
      name,
      phone,
      logo_url,
      address_zip,
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
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
    console.error('Error in saveCompanySettings:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao salvar as configurações.',
    }
  }
}
