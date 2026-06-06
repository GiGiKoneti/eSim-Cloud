import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  List, ListItemText, Tooltip, Popover,
  Button, Snackbar, IconButton
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import StarIcon from '@material-ui/icons/Star'
import StarBorderIcon from '@material-ui/icons/StarBorder'

import './Helper/SchematicEditor.css'
import { AddComponent } from './Helper/SideBar.js'
import { addFavourite, removeFavourite, isFavourite } from '../../utils/favouritesStorage'

const useStyles = makeStyles((theme) => ({
  popupInfo: {
    margin: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    border: '1px solid blue',
    borderRadius: '5px'
  },
  compWrapper: {
    position: 'relative',
    display: 'inline-block'
  },
  starBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
    zIndex: 2,
    background: 'rgba(255,255,255,0.75)',
    borderRadius: '50%',
    '&:hover': {
      background: 'rgba(255,255,255,0.95)'
    }
  },
  starIconOn: {
    fontSize: 14,
    color: '#f4b400'
  },
  starIconOff: {
    fontSize: 14,
    color: '#9e9e9e'
  }
}))

// ─── localStorage-backed favourites — no auth required ───────────────────────
export default function SideComp ({ favourite, setFavourite, component }) {
  const classes = useStyles()
  const imageRef = useRef(null)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '' })

  const showSnackbar = (message) => setSnackbar({ open: true, message })
  const closeSnackbar = (_, reason) => {
    if (reason === 'clickaway') return
    setSnackbar((s) => ({ ...s, open: false }))
  }

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {
    // Make component thumbnail draggable onto the mxGraph canvas
    AddComponent(component, imageRef.current)
    // eslint-disable-next-line
  }, [])

  // Returns true when this component is already in the user's favourites list.
  // Reads from localStorage via isFavourite() — works without auth.
  const isStarred = () => {
    // Prefer the parent's in-memory state (passed as `favourite` prop) when available
    // so the star updates immediately on toggle without waiting for a localStorage re-read.
    if (favourite && Array.isArray(favourite)) {
      return favourite.some((fav) => fav.id === component.id)
    }
    return isFavourite(component.id)
  }

  // ── localStorage-backed add ──────────────────────────────────────────────
  const handleAddFavourite = () => {
    const updated = addFavourite(component)
    if (setFavourite) setFavourite(updated)
    showSnackbar('Added to favourites')
    setAnchorEl(null)
  }

  // ── localStorage-backed remove ───────────────────────────────────────────
  const handleRemoveFavourite = () => {
    const updated = removeFavourite(component.id)
    if (setFavourite) setFavourite(updated)
    showSnackbar('Removed from favourites')
    setAnchorEl(null)
  }

  // One-click star toggle on thumbnail — bypasses the info popover.
  // Works for ALL users — no token check required.
  const handleStarToggle = (e) => {
    e.stopPropagation()
    if (isStarred()) {
      handleRemoveFavourite()
    } else {
      handleAddFavourite()
    }
  }

  return (
    <div>
      {/* Wrapper gives the star IconButton an absolute-position anchor */}
      <div className={classes.compWrapper}>
        <Tooltip title={component.full_name + ' : ' + component.description} arrow>
          {/* Display Image thumbnail; also the drag source registered by AddComponent */}
          <img
            ref={imageRef}
            className='compImage'
            src={'../' + (component.svg_path || '')}
            alt={component.name || 'component'}
            aria-describedby={id}
            onClick={handleClick}
            onError={(e) => { e.target.style.visibility = 'hidden' }}
          />
        </Tooltip>

        {/* Star icon overlay — shown for ALL users, no auth required */}
        <Tooltip title={isStarred() ? 'Remove from favourites' : 'Add to favourites'} arrow>
          <IconButton
            className={classes.starBtn}
            size="small"
            onClick={handleStarToggle}
            aria-label={
              isStarred()
                ? `Remove ${component.name} from favourites`
                : `Add ${component.name} to favourites`
            }
          >
            {isStarred()
              ? <StarIcon className={classes.starIconOn} />
              : <StarBorderIcon className={classes.starIconOff} />}
          </IconButton>
        </Tooltip>
      </div>

      {/* Popover — shows component details on thumbnail click */}
      <Popover
        id={id}
        open={open}
        className={classes.popup}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <List component="div" className={classes.popupInfo} disablePadding dense>
          <ListItemText>
            <b>Component Name:</b> {component.name}
          </ListItemText>

          {component.description !== '' &&
            <ListItemText>
              <b>Description:</b> {component.description}
            </ListItemText>
          }

          {component.keyword !== '' &&
            <ListItemText>
              <b>Keywords:</b> {component.keyword}
            </ListItemText>
          }

          {component.data_link !== '' &&
            <ListItemText>
              <b>Datasheet:</b>{' '}
              <a href={component.data_link} rel="noopener noreferrer" target="_blank">
                {component.data_link}
              </a>
            </ListItemText>
          }

          {/* Add / Remove from Favourites buttons — no auth required */}
          {!isStarred() &&
            <ListItemText>
              <Button onClick={handleAddFavourite}>
                Add to Favourites
              </Button>
            </ListItemText>
          }

          {isStarred() &&
            <ListItemText>
              <Button onClick={handleRemoveFavourite}>
                Remove from Favourites
              </Button>
            </ListItemText>
          }
        </List>
      </Popover>

      <Snackbar
        style={{ zIndex: 100 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={closeSnackbar}
        message={snackbar.message}
        action={
          <>
            <IconButton size="small" aria-label="close" color="inherit" onClick={closeSnackbar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </div>
  )
}

SideComp.propTypes = {
  component: PropTypes.object.isRequired,
  setFavourite: PropTypes.func,
  favourite: PropTypes.array
}
