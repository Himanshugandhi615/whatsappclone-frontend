import React from 'react';
import { NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/Auth';
import axios from "axios";
import { toast } from 'react-toastify';
import styled from 'styled-components';
import whatsappLogo from '../assets/logo.png';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {base_url} from "../helper/constant";

// Styled components
const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

const Card = styled.div`
    width: 400px;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
    width: 100px;
    margin: 0 auto;
    display: block;
`;

const SignInForm = styled(Form)`
    margin-top: 20px;
`;

const Input = styled(Field)`
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
    background-color: #2ecc71;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #128C7E;
    }
`;

const SignUpLink = styled.div`
    margin-top: 10px;
    text-align: center;
`;

const ErrorText = styled.div`
    color: red;
    margin-bottom: 10px;
`;

const SignIn = () => {
    const { isLoggedIn, storeTokenInLS } = useAuth();
    if (isLoggedIn) {
        return <Navigate to="/" />;
    }
    const navigate = useNavigate();

    const initialValues = {
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await axios.post(`${base_url}/signin`, values);
            const result = response.data;
            if (result.message) {
                toast.success(result.message);
                storeTokenInLS(result.token);
                resetForm();
                setTimeout(() => {
                    navigate("/");
                }, 4000);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(error.response.data.error);
            console.log(error.response.data.error);
        }
        setSubmitting(false);
    };

    return (
        <Container>
            <Card>
                <Logo src={whatsappLogo} alt="WhatsApp Logo" />
                <h2 className="text-center mb-4">Sign In to WhatsApp</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <SignInForm>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                            />
                            <ErrorMessage name="email" component={ErrorText} />
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                            />
                            <ErrorMessage name="password" component={ErrorText} />
                            <Button type="submit" disabled={isSubmitting}>Sign In</Button>
                        </SignInForm>
                    )}
                </Formik>
                <SignUpLink>
                    Don't have an account? <NavLink to="/signup">Sign Up</NavLink>
                </SignUpLink>
            </Card>
        </Container>
    );
};

export default SignIn;
