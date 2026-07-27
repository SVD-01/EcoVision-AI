/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, FACILITY_MANAGER, SUSTAINABILITY_LEAD, OPERATOR, STUDENT, CITIZEN]
 *         ecoPoints:
 *           type: integer
 *         xp:
 *           type: integer
 *         level:
 *           type: integer
 *         streak:
 *           type: integer
 *     ScanResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fileName:
 *           type: string
 *         category:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             label:
 *               type: string
 *             recommendation:
 *               type: string
 *         confidence:
 *           type: number
 *         boundingBoxes:
 *           type: array
 *           items:
 *             type: object
 *         impact:
 *           type: object
 *           properties:
 *             carbonKg:
 *               type: number
 *             waterLiters:
 *               type: number
 *             points:
 *               type: integer
 *     SmartBin:
 *       type: object
 *       properties:
 *         binCode:
 *           type: string
 *         name:
 *           type: string
 *         fillLevel:
 *           type: integer
 *         status:
 *           type: string
 */
export const openApiSchemas = {};
