import React from 'react';
import axios from "axios";
import { useNavigate, NavLink, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../store/Auth';
import styled from 'styled-components';
import whatsappLogo from '../assets/logo.png';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {base_url} from "../helper/constant"
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

const SignUpForm = styled(Form)`
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

const SignInLink = styled.div`
    margin-top: 10px;
    text-align: center;
`;

const ErrorText = styled.div`
    color: red;
    margin-bottom: 10px;
`;

const SignUp = () => {
    const { isLoggedIn, storeTokenInLS } = useAuth();
    if (isLoggedIn) {
        return <Navigate to="/" />;
    }
    const navigate = useNavigate();

    const initialValues = {
        username: '',
        email: '',
        phone: '',
        password: '',
    };

    const validationSchema = Yup.object({
        username: Yup.string().required('Username is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        phone: Yup.string().required('Phone number is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await axios.post(`${base_url}/signup`, values);
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
                <h2 className="text-center mb-4">Sign Up for WhatsApp</h2>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <SignUpForm>
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Username"
                            />
                            <ErrorMessage name="username" component={ErrorText} />
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Email"
                            />
                            <ErrorMessage name="email" component={ErrorText} />
                            <Input
                                type="text"
                                id="phone"
                                name="phone"
                                placeholder="Phone Number"
                            />
                            <ErrorMessage name="phone" component={ErrorText} />
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                            />
                            <ErrorMessage name="password" component={ErrorText} />
                            <Button type="submit" disabled={isSubmitting}>Sign Up</Button>
                        </SignUpForm>
                    )}
                </Formik>
                <SignInLink>
                    Already have an account? <NavLink to="/signin">Sign In</NavLink>
                </SignInLink>
            </Card>
        </Container>
    );
};

export default SignUp;
