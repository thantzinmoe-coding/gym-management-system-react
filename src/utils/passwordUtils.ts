// utils/passwordUtils.ts
export const checkPasswordStrength = (password: string) => {
    let score = 0;
    const rules = [
        /.{6,}/, // at least 8 chars
        /[A-Z]/, // uppercase
        /[a-z]/, // lowercase
        /[0-9]/, // number
        /[^A-Za-z0-9]/, // special char
    ];

    rules.forEach((rule) => {
        if (rule.test(password)) score++;
    });

    if (score <= 2) return { label: "Weak", color: "text-red-500" };
    if (score === 3) return { label: "Medium", color: "text-yellow-500" };
    return { label: "Strong", color: "text-green-600" };
};
