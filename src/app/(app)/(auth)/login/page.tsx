"use client";

import Button from "@/components/Button";
import Typo from "@/components/Typo";
import Link from "next/link";
import styled from "styled-components";
import { Formik, Form as FormikForm } from "formik";
import Input from "@/components/Input";
import { AuthMutations, AuthQueries } from "@/services/service.auth";
import { useRouter } from "next/navigation";
import { AuthStorage } from "@/auth/auth.utils";
import { notifyError } from "@/utils/utils.notification";

export default function Login() {
  const router = useRouter();
  const { data: me, isPending: isMePending } = AuthQueries.useMyAccount();
  const { mutate: login, isPending: isLoginPending } = AuthMutations.useLogin();

  if (!!me?.id) router.replace("/");

  const onSubmit = (values: AuthMutations.ILoginPayload) => {
    login(values, {
      onSuccess: (data) => {
        AuthStorage.setRefreshToken(data.refreshToken);
        AuthStorage.setAccessToken(data.accessToken);
        router.replace("/");
      },
      onError: (error) => {
        notifyError(error.message);
      },
    });
  };

  return (
    <S.Login>
      {/* {isAuthenticated && <Navigate to="/" />} */}
      <S.Title variant="h4">Management Portal</S.Title>
      <Formik onSubmit={onSubmit} initialValues={{ email: "", password: "" }}>
        <S.Form>
          {/* Username ----------------------------------------------------- */}
          <S.FormGroup>
            <S.InputLabel variant="body1">Username:</S.InputLabel>
            <Input type="text" name="email" />
          </S.FormGroup>

          {/* Password ----------------------------------------------------- */}
          <S.FormGroup>
            <S.InputLabel variant="body1">Password:</S.InputLabel>
            <Input type="password" name="password" />
          </S.FormGroup>

          {/* Buttons ----------------------------------------------------- */}
          <S.LoginButton
            size="large"
            type="submit"
            disabled={isMePending || isLoginPending}>
            Login
          </S.LoginButton>
        </S.Form>
      </Formik>
    </S.Login>
  );
}

namespace S {
  export const Login = styled.div`
    max-width: 384px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--s-6);
  `;

  export const Title = styled(Typo)`
    color: var(--c-green-8);
  `;

  export const Form = styled(FormikForm)`
    background-color: var(--c-white);
    padding: var(--s-6);
    padding-bottom: var(--s-8);
    box-shadow: var(--box-shadow);
    border-radius: var(--br-3);
    width: 100%;
  `;

  export const FormGroup = styled.div`
    margin-bottom: var(--s-3);
  `;

  export const InputLabel = styled(Typo)`
    margin-bottom: var(--s-1);
  `;

  export const LoginButton = styled(Button)`
    width: 100%;
    margin: var(--s-3) 0;
  `;

  export const ForgotPasswordContainer = styled.div`
    width: 100%;
    text-align: center;
  `;

  export const ForgotPasswordLink = styled(Link)`
    text-decoration: none;
    font-family: var(--ff-regular);
    font-size: var(--fs-body2);
    color: var(--c-blue);
    margin: 0;
  `;
}
