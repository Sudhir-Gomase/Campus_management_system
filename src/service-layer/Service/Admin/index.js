import { getUserForAdmin,
  department,
  academicYearData,
  companyList,
  donutGraphData,
  donutGraphDataFromLinkage,
  registerBulkEmployee,
  addstudent,
  overallCompanyData,
  overallCompanyDataUpdate,
  deleteStudent
} from "../../../data-layer/repositories/Admin/index.js";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../../../utils/logger.js";
import { createObjectCsvWriter } from "csv-writer";



export const adminloginService = async (email, password) => {
  try {
    const user = await getUserForAdmin(email);
    console.log("user", user);
    console.log("email", email);
    console.log("password", password);

    if (!user) return "user not found";

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return "password not matched";
    }

    // cleanup
    delete user.password;
    delete user.password_node;
    delete user.created_at;
    delete user.modified_at;
    delete user.onsite;

    // payload for JWT
    const userPayload = {
      id: user.admin_id,
      email: user.email,
      role: user.role,
    };

    const secretBuffer = Buffer.from(
      process.env.JWT_SECRET_KEY || "secret-key"
    );

    const token = jwt.sign(userPayload, secretBuffer, { expiresIn: "24h" });

    return {
      userId: user.admin_id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      token,
      expireIN: "24h",
    };
  } catch (err) {
    logger.error(`SERVICE :: ADMIN :: login :: ERROR`, err);
    throw new Error("INTERNAL SERVER ERROR");
  }
};


export const departmentsService = async(id)=>{
  try{
    const data = await department(id);
    return data
  }catch(error){
   logger.error(`SERVICE :: ADMIN :: departmentsService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
}


export const academicYearDataService = async (year,department_id,company_id,status) => {
  try {
    const data = await academicYearData(year,department_id,company_id,status);

    
    return data
  } catch (error) {
    logger.error(
      `SERVICE :: ADMIN :: academicYearDataService :: ERROR`,
      error
    );
    throw new Error("INTERNAL SERVER ERROR");
  }
};



export const companyListService = async (id) => {
  try {
    const data = await companyList(id);

    if (!id) {
      const count = data.length;  
      return {
        data: data,
        count: count,
      };
    } else {
      return data;
    }
  } catch (error) {
    logger.error(`SERVICE :: ADMIN :: companyListService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
};


export const donutGraphDataService = async (department_id) => {
  try {
    const students = await donutGraphData(department_id); // students of department
    const studentIds = students.map(s => s.student_id);

     const statuses = await donutGraphDataFromLinkage(studentIds);
    // Fetch all placement statuses for these students in one go
   

    // Initialize counters
    const counts = {
      applied: 0,
      shortlisted: 0,
      interviewed: 0,
      selected: 0,
      rejected: 0,
      placed: 0,
      unplaced: 0,
      total: students.length
    };

    // Count statuses
    for (const row of statuses) {
      if (row.placement_status && counts.hasOwnProperty(row.placement_status)) {
        counts[row.placement_status] += 1;
      }
    }

    // Calculate placed/unplaced
    counts.placed = counts.selected;
    counts.unplaced = counts.total - counts.placed;

    return counts;
  } catch (error) {
    logger.error(`SERVICE :: ADMIN :: donutGraphDataService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
};


export const downloadTemplateService = async () => {
  const filePath = "StudentRegister.csv";

  const headers = [
    { id: "email", title: "Email" },
    { id: "roll_no", title: "Roll No" },
  ];

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords([]); // only headers
  return filePath;
};



  export const registerBulkEmployeeService = async (employees) => {
    try{
      // console.log("employees",employees)
    const data = await registerBulkEmployee(employees);
    return data
    }catch(error){
    logger.error(`SERVICE :: ADMIN :: registerBulkEmployeeService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
  };



  export const addstudentService = async (employees) => {
    try{
    const data = await addstudent(employees);
    return data;
    }catch(error){
    logger.error(`SERVICE :: ADMIN :: addstudentService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
  };

    export const overallCompanyDataService = async (is_approved) => {
    try{
    const data = await overallCompanyData(is_approved);
    return data
    }catch(error){
    logger.error(`SERVICE :: ADMIN :: overallCompanyDataService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
  };
  
  export const overallCompanyDataUpdateService = async (company_id,is_approved) => {
    try{
    const data = await overallCompanyDataUpdate(company_id,is_approved);
    return data
    }catch(error){
    logger.error(`SERVICE :: ADMIN :: overallCompanyDataUpdateService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
  };

  
    export const deleteStudentService = async (student_id) => {
    try{
    const data = await deleteStudent(student_id);
    return data
    }catch(error){
    logger.error(`SERVICE :: ADMIN :: deleteStudentService :: ERROR`, error);
    throw new Error("INTERNAL SERVER ERROR");
  }
  };