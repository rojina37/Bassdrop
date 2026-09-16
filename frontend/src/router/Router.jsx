import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import HomeOrLanding from './HomeOrLanding'
import Chat from '../panels/user/Chat'
import Library from '../panels/user/Library'
import Login from '../panels/user/Login'
import Search from '../panels/user/Search'
import Signup from '../panels/user/Signup'
import SongPage from '../panels/user/SongPage'
import ArtistPage from '../panels/user/ArtistPage'
import Playlists from '../panels/user/Playlists'
import PlaylistPage from '../panels/user/PlaylistPage'
import Admin from '../panels/admin/pages/Admin'

import { ViewSongsPage } from '../panels/admin/pages/songs/ViewSongsPage'
import { AdminLayout } from '../panels/admin/layout/AdminLayout'
import { AdminShell } from '../panels/admin/layout/AdminShell'
import ViewArtistPage from '../panels/admin/pages/artists/ViewArtistPage'
import AddGenrePage from '../panels/admin/pages/genres/AddGenrePage'
import ViewUserPage from '../panels/admin/pages/users/ViewUserPage'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomeOrLanding />,
      },
      {
        element: <ProtectedRoute />,
        children: [
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
            path: '/song/:id',
            element: <SongPage />,
          },
          {
            path: '/artist/:id',
            element: <ArtistPage />,
          },
          {
            path: '/playlists',
            element: <Playlists />,
          },
          {
            path: '/playlist/:id',
            element: <PlaylistPage />,
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/signup',
            element: <Signup />,
          },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        element: <ProtectedRoute requireAdmin />,
        children: [
          {
            element: <AdminShell />,
            children: [
              {
                index: true,
                element: <Admin />,
              },
              {
                path: '/admin/view/song',
                element: <ViewSongsPage />,
              },
              {
                path: '/admin/add/song',
                element: <Navigate to="/admin/view/song" replace />,
              },
              {
                path: '/admin/view/artist',
                element: <ViewArtistPage />,
              },
              {
                path: '/admin/add/artist',
                element: <Navigate to="/admin/view/artist" replace />,
              },
              {
                path: '/admin/add/genre',
                element: <AddGenrePage />,
              },
              {
                path: '/admin/view/user',
                element: <ViewUserPage />,
              },
            ],
          },
        ],
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: '/admin/login',
            element: <Login />,
          },
          {
            path: '/admin/signup',
            element: <Signup />,
          },
        ],
      },
    ],
  },
])

export default router
