const fs = require('fs');
let file = fs.readFileSync('src/pages/auth/Cadastro.tsx', 'utf8');

const maskHelpers = `
  const handleCPFMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\\d{3})(\\d)/, '$1.$2');
    value = value.replace(/(\\d{3})(\\d)/, '$1.$2');
    value = value.replace(/(\\d{3})(\\d{1,2})$/, '$1-$2');
    e.target.value = value;
    return value;
  };

  const handleTelefoneMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\\d{2})(\\d)/g, '($1) $2');
    value = value.replace(/(\\d)(\\d{4})$/, '$1-$2');
    e.target.value = value;
    return value;
  };
`;

file = file.replace("const onSubmit = async", maskHelpers + "\n  const onSubmit = async");

file = file.replace(
  /{...register\('cpf'\)}/,
  `{...register('cpf')} onChange={(e) => { register('cpf').onChange(e); handleCPFMask(e); }}`
);

file = file.replace(
  /{...register\('telefone'\)}/,
  `{...register('telefone')} onChange={(e) => { register('telefone').onChange(e); handleTelefoneMask(e); }}`
);

fs.writeFileSync('src/pages/auth/Cadastro.tsx', file);
