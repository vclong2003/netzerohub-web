import { SelectProps } from "antd";
import * as S from "./index.styled";
import { Field, useFormikContext } from "formik";

interface ISelectProps extends SelectProps {
  name: string;
  error?: string;
}

export default function Select({ name, error, ...props }: ISelectProps) {
  const { setFieldValue, values } = useFormikContext<{
    [key: string]: string;
  }>();

  const handleChange = (value: string) => {
    setFieldValue(name, value);
  };

  return (
    <>
      <Field
        component={S.Select}
        value={values[name]}
        onChange={handleChange}
        $error={!!error}
        {...props}
      />
      {error && <S.Error variant="body2">{error}</S.Error>}
    </>
  );
}
