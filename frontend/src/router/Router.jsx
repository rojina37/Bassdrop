import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '../layout/Layout'
import Home from '../panels/user/Home'
import Chat from '../panels/user/Chat'
import Library from '../panels/user/Library'
import Login from '../panels/user/Login'
import Search from '../panels/user/Search'
import Settings from '../panels/user/Settings'
import Signup from '../panels/user/Signup'
import Admin from '../panels/admin/pages/Admin' 

import { AddSongPage } from '../panels/admin/pages/songs/AddSongPage'
import { ViewSongsPage } from '../panels/admin/pages/songs/ViewSongsPage'
import { AdminLayout } from '../panels/admin/layout/AdminLayout'
import ViewArtistPage from '../panels/admin/pages/artists/ViewArtistPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/chat',
        element: <Chat />,
      },
      {
        path: '/library',
        element: <Library />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Admin />,
      },
      {
        path: '/admin/add/song',
        element: <AddSongPage />,
      },
      {
        path: '/admin/view/song',
        element: <ViewSongsPage />,
      },
      {
        path: '/admin/view/artist',
        element: <ViewArtistPage />,
      },
      {
        path: '/admin/login',
        element: <Login />,
      },
    ],
  },
])

export default router
