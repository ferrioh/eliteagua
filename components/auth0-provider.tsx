'use client'

import React from 'react'
import { Auth0Provider, Auth0Context, initialContext, type Auth0ContextInterface } from '@auth0/auth0-react'

const guestContext = {
  ...initialContext,
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
} as unknown as Auth0ContextInterface

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''

  const isPlaceholder = !domain || domain.includes('elite-agua.us.auth0.com') || !clientId || clientId.includes('mock_client_id') || clientId.includes('dummy_client_id')

  if (isPlaceholder) {
    return <Auth0Context.Provider value={guestContext}>{children}</Auth0Context.Provider>
  }

  const redirectUri = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        connection: 'google-oauth2',
        prompt: 'select_account',
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  )
}