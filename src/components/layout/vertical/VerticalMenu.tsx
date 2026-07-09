// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        {/* OTT Streaming Platform Navigation */}
        <MenuItem href='/' icon={<i className='ri-dashboard-3-line' />}>
          Overview
        </MenuItem>

        <MenuSection label='Content Management'>
          <SubMenu label='Content' icon={<i className='ri-movie-2-line' />}>
            {/* <MenuItem href='/content/titles'>Titles</MenuItem> */}
            <MenuItem href='/content/movies'>Movies</MenuItem>
            <MenuItem href='/content/upload'>Upload Movie</MenuItem>
            <MenuItem href='/content/tvseries'>TV Series</MenuItem>
            <MenuItem href='/content/tvseries/upload/content'>Upload TV Series</MenuItem>
            <MenuItem href='/content/categories'>Categories</MenuItem>
            <MenuItem href='/content/tags'>Tags</MenuItem>
            <MenuItem href='/content/news'>News</MenuItem>
          </SubMenu>
          <SubMenu label='Person' icon={<i className='ri-user-star-line' />}>
            <MenuItem href='/person/actors'>Actors</MenuItem>
            <MenuItem href='/person/directors'>Directors</MenuItem>
          </SubMenu>
        </MenuSection>

        <MenuSection label='User Management'>
          <MenuItem href='/users' icon={<i className='ri-group-line' />}>
            Users
          </MenuItem>
          <MenuItem href='/reports' icon={<i className='ri-flag-line' />}>
            Reports
          </MenuItem>
          <MenuItem href='/watch-party' icon={<i className='ri-tv-2-line' />}>
            Watch Party
          </MenuItem>
        </MenuSection>

        <MenuSection label='Analytics & Reports'>
          <MenuItem href='/reviews' icon={<i className='ri-star-line' />}>
            Reviews
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
