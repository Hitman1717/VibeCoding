import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Navbar, Nav, NavDropdown, Container, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import ThemeSwitcher from '../ThemeSwitcher';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchInvitations = async () => {
        try {
          const { data } = await api.get('/api/invitations');
          setInvitationCount(data.length);
        } catch (error) {
          console.error("Failed to fetch invitations count");
        }
      };
      fetchInvitations();
      // Optional: Set up a poller or socket event to update this in real-time
    }
  }, [user]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <LinkContainer to={user ? "/" : "/login"}>
          <Navbar.Brand>CollabApp</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <ThemeSwitcher />
            {user ? (
              <>
                <LinkContainer to="/invitations">
                  <Nav.Link>
                    Invitations {invitationCount > 0 && <Badge pill bg="danger">{invitationCount}</Badge>}
                  </Nav.Link>
                </LinkContainer>
                <NavDropdown title={`Hi, ${user.username}`} id="username">
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;