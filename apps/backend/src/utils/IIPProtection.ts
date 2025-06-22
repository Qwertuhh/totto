/**
 * Protects an email address by keeping only the first 6 characters of the 
 * username and adding *** to the end before the @.
 * @param {string} email The email address to protect.
 * @returns {string} The protected email address.
 */
function emailProtection(email: string): string {
  const [username, domain] = email.split("@");
  const protectedusername =
    username.substring(0, 6) + "***";
  return `${protectedusername}@${domain}`; 
}

export { emailProtection };
