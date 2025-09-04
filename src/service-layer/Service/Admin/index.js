import { getUserForAdmin,department,academicYearData,companyList} from "../../../data-layer/repositories/Admin/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../../../utils/logger.js";

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


export const academicYearDataService = async (id) => {
  try {
    const data = await academicYearData(id);
    if (id) {
      // Initialize counters
      let placed = 0;
      let unplaced = 0;
      let notApplied = 0;
      let applied = 0;
      let interviewing = 0;

      // Loop through records and count statuses
      for (const record of data) {
        switch (record.placement_status) {
          case "Selected":
            placed++;
            break;
          case "Rejected":
            unplaced++;
            break;
          case "Not Applied":
            notApplied++;
            break;
          case "Applied":
            applied++;
            break;
          case "Interviewing":
            interviewing++;
            break;
          default:
            break;
        }
      }

      // Prepare count array/object
      const countArray = {
        placed,
        unplaced,
        notApplied,
        applied,
        interviewing,
      };

      return {
        data,
        count: countArray,
      };
    } else {
      return { data };
    }
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
      const count = data.length;  // no need for a loop
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
