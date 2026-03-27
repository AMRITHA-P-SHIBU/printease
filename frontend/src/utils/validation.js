// Validation utility functions

/**
 * Validates Student SJCET ID format: YYBBnnn
 * YY = 2 digits (year of join)
 * BB = 2 alphabets (branch: cs, me, ad, ec, cy, es, ee, ce)
 * nnn = 3 digits
 * Example: 23cs156
 */
export const validateStudentSJCETID = (sjcetId) => {
  if (!sjcetId) return { valid: false, message: "SJCET ID is required" };
  
  const sjcetRegex = /^(\d{2})(cs|me|ad|ec|cy|es|ee|ce)(\d{3})$/i;
  const match = sjcetId.toLowerCase().match(sjcetRegex);
  
  if (!match) {
    return {
      valid: false,
      message: "Invalid format for sjcet id"
    };
  }
  
  return { valid: true, message: "", year: match[1], branch: match[2], number: match[3] };
};

/**
 * Validates Faculty SJCET ID format: YYBBBnnn
 * YY = 2 digits (year of join)
 * BBB = 3 alphabets (branch: cse, ece, eee, ecs)
 * nnn = 3 digits
 * Example: 23cse156
 */
export const validateFacultySJCETID = (sjcetId) => {
  if (!sjcetId) return { valid: false, message: "SJCET ID is required" };
  
  const sjcetRegex = /^(\d{2})(cse|ece|eee|ecs)(\d{3})$/i;
  const match = sjcetId.toLowerCase().match(sjcetRegex);
  
  if (!match) {
    return {
      valid: false,
      message: "Invalid format for sjcet id"
    };
  }
  
  return { valid: true, message: "", year: match[1], branch: match[2], number: match[3] };
};

/**
 * Validates SJCET ID based on role
 */
export const validateSJCETID = (sjcetId, role = "student") => {
  if (role === "faculty") {
    return validateFacultySJCETID(sjcetId);
  }
  return validateStudentSJCETID(sjcetId);
};

/**
 * Validates phone number - exactly 10 digits
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: false, message: "Phone number is required" };
  
  const phoneRegex = /^\d{10}$/;
  
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      message: "Phone number must be exactly 10 digits"
    };
  }
  
  return { valid: true, message: "" };
};

/**
 * Validates student college email
 * Format: fullname(no space)passoutyear@branch.sjcetpalai.ac.in
 * Example: liyaprince2027@cs.sjcetpalai.ac.in
 * where fullname is from the full_name field, passoutyear is calculated from SJCET year + 4
 * and branch is the 2-letter branch code from SJCET ID
 */
export const validateStudentCollegeEmail = (email, fullName, sjcetId) => {
  if (!email) return { valid: false, message: "College email is required" };
  
  // Validate SJCET ID format
  const sjcetValidation = validateStudentSJCETID(sjcetId);
  if (!sjcetValidation.valid) {
    return { valid: false, message: "Please provide a valid SJCET ID first" };
  }
  
  const joinYear = parseInt(sjcetValidation.year);
  const branch = sjcetValidation.branch.toLowerCase();
  
  // Calculate passout year (assuming 4-year course)
  const passoutYear = 2000 + joinYear + 4;
  
  // Remove spaces from full name and convert to lowercase
  const nameWithoutSpace = fullName.replace(/\s+/g, "").toLowerCase();
  
  // Expected email format: fullname+passoutyear@branch.sjcetpalai.ac.in
  const expectedEmailPattern = `^${nameWithoutSpace}${passoutYear}@${branch}\\.sjcetpalai\\.ac\\.in$`;
  const expectedEmailRegex = new RegExp(expectedEmailPattern, 'i');
  
  if (!expectedEmailRegex.test(email.toLowerCase())) {
    return {
      valid: false,
      message: "Invalid format for college mail id"
    };
  }
  
  return { valid: true, message: "" };
};

/**
 * Validates faculty college email
 * Format: fullname(no space)@sjcetpalai.ac.in
 * Example: liyaprince@sjcetpalai.ac.in
 * where fullname is from the full_name field without spaces
 */
export const validateFacultyCollegeEmail = (email, fullName, sjcetId) => {
  if (!email) return { valid: false, message: "College email is required" };
  
  // Validate SJCET ID format
  const sjcetValidation = validateFacultySJCETID(sjcetId);
  if (!sjcetValidation.valid) {
    return { valid: false, message: "Please provide a valid SJCET ID first" };
  }
  
  // Remove spaces from full name and convert to lowercase
  const nameWithoutSpace = fullName.replace(/\s+/g, "").toLowerCase();
  
  // Expected email format: fullname@sjcetpalai.ac.in
  const expectedEmailPattern = `^${nameWithoutSpace}@sjcetpalai\\.ac\\.in$`;
  const expectedEmailRegex = new RegExp(expectedEmailPattern, 'i');
  
  if (!expectedEmailRegex.test(email.toLowerCase())) {
    return {
      valid: false,
      message: "Invalid format for college mail id"
    };
  }
  
  return { valid: true, message: "" };
};

/**
 * Validates college email based on role
 */
export const validateCollegeEmail = (email, fullName, sjcetId, role = "student") => {
  if (role === "faculty") {
    return validateFacultyCollegeEmail(email, fullName, sjcetId);
  }
  return validateStudentCollegeEmail(email, fullName, sjcetId);
};

/**
 * Validates email format (basic email validation)
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, message: "Email is required" };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }
  
  return { valid: true, message: "" };
};

/**
 * Validates full name - not empty
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim() === "") {
    return { valid: false, message: "Full name is required" };
  }
  
  return { valid: true, message: "" };
};
