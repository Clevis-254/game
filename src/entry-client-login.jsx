import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { Login } from './login'

hydrateRoot(
  document.getElementById('root'),
  <Login />
)