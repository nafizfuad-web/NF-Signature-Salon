// NF Signature Salon — development fixtures
//
// Kept separate from API service logic so they can be replaced by real backend
// responses (see client/src/services/api/) without touching UI components.
// These fixtures are only used when VITE_USE_MOCK_DATA is not "false".
//
// Authentication is deliberately NOT mocked anywhere in this project.

import type {
  AdminDashboardData,
  Appointment,
  CustomerDashboardData,
  CustomerRecord,
  ServiceItem,
} from '@/types'

export const services: ServiceItem[] = [
  { id:'s1', title:"Men's Haircut", description:'A precision haircut tailored to your style.', price:'$35', duration:'45 min', category:'hair', featured:true, image:'/services/mens-haircut.jpg', includes:['Consultation','Precision cut','Wash and finish'], goodToKnow:['Allow 45–60 minutes'] },
  { id:'s2', title:"Women's Haircut", description:'A personalised cut for shape, movement and your routine.', price:'$55', duration:'60 min', category:'hair', featured:true, image:'/services/womens-haircut.jpg', includes:['Consultation','Custom cut','Wash and blow-dry'], goodToKnow:['Bring reference photos if you have them'] },
  { id:'s3', title:'Hair Styling', description:'A polished blowout or occasion-ready finish.', price:'$45', duration:'45 min', category:'hair', featured:true, image:'/services/hair-styling.jpg', includes:['Style consultation','Blow-dry or finishing','Long-wear setting'], goodToKnow:['Arrive with dry hair for an occasion style'] },
  { id:'s4', title:'Hair Coloring', description:'Custom salon colour for rich, dimensional results.', price:'$140', duration:'150 min', category:'hair', featured:true, image:'/services/hair-coloring.jpg', includes:['Colour consultation','Custom colour','Gloss and finish'], goodToKnow:['A patch test is required 48 hours before first colour'] },
  { id:'s5', title:'Hair Highlights', description:'Dimensional lightening placed to flatter your cut and tone.', price:'$120', duration:'120 min', category:'hair', image:'/services/hair-highlights.jpg', includes:['Tone and placement plan','Foil highlights','Toner and style'], goodToKnow:['Results vary with your starting shade'] },
  { id:'s6', title:'Hair Treatment', description:'A restorative ritual to improve softness and shine.', price:'$65', duration:'60 min', category:'hair', image:'/services/hair-treatment.jpg', includes:['Hair assessment','Deep-conditioning treatment','Heat treatment and finish'], goodToKnow:['Ideal for dry or regularly styled hair'] },
  { id:'s7', title:'Keratin Treatment', description:'A smoothing treatment that reduces frizz and styling time.', price:'$180', duration:'150 min', category:'hair', featured:true, image:'/services/keratin-treatment.jpg', includes:['Hair assessment','Keratin application','Seal and style'], goodToKnow:['Do not wash hair for 72 hours afterwards'] },
  { id:'s8', title:'Hair Spa', description:'A deeply relaxing scalp and hair hydration ritual.', price:'$75', duration:'60 min', category:'hair', image:'/services/hair-spa.jpg', includes:['Scalp cleanse','Steam and masque','Scalp massage'], goodToKnow:['Leave time to relax after the treatment'] },
  { id:'s9', title:'Beard Trimming', description:'A precise beard shape with clean, balanced lines.', price:'$25', duration:'30 min', category:'hair', image:'/services/beard-trimming.jpg', includes:['Shape consultation','Trim and line-up','Beard conditioning'], goodToKnow:['Tell us how you normally wear your beard'] },
  { id:'s10', title:'Beard Styling', description:'Custom beard shaping for a groomed, intentional finish.', price:'$30', duration:'35 min', category:'hair', image:'/services/beard-styling.jpg', includes:['Length and shape design','Detail trimming','Beard oil finish'], goodToKnow:['Allow extra time for major shape changes'] },
  { id:'s11', title:'Shaving', description:'A traditional hot-towel shave for a smooth finish.', price:'$28', duration:'30 min', category:'hair', image:'/services/shaving.jpg', includes:['Hot towel preparation','Traditional shave','Cooling balm'], goodToKnow:['Please mention sensitive or easily irritated skin'] },
  { id:'s12', title:'Facial', description:'A tailored facial that cleanses and restores radiance.', price:'$90', duration:'60 min', category:'skin', featured:true, image:'/services/facial.jpg', includes:['Skin analysis','Cleanse and exfoliation','Mask and hydration'], goodToKnow:['Skip retinoids for 48 hours before your visit'] },
  { id:'s13', title:'Skin Care', description:'A custom skin ritual selected around your current concerns.', price:'$110', duration:'75 min', category:'skin', featured:true, image:'/services/skin-care.jpg', includes:['Skin consultation','Targeted treatment','Barrier care and SPF'], goodToKnow:['Tell us about allergies and active skin products'] },
  { id:'s14', title:'Manicure', description:'Nail shaping and classic care for a polished finish.', price:'$40', duration:'45 min', category:'nails', featured:true, image:'/services/manicure.jpg', includes:['Nail shaping','Cuticle care','Classic polish'], goodToKnow:['Bring inspiration for a specific shape'] },
  { id:'s15', title:'Pedicure', description:'A restorative foot ritual with shaping and polish.', price:'$55', duration:'50 min', category:'nails', featured:true, image:'/services/pedicure.jpg', includes:['Foot soak','Exfoliation','Shape and polish'], goodToKnow:['Wear open-toe shoes afterwards'] },
  { id:'s16', title:'Head Massage', description:'A calming massage for scalp, neck and shoulder tension.', price:'$65', duration:'45 min', category:'wellness', featured:true, image:'/services/head-massage.jpg', includes:['Scalp massage','Neck and shoulder work','Warm oil finish'], goodToKnow:['No need to undress'] },
  { id:'s17', title:'Bridal Makeup', description:'Long-wearing bridal makeup tailored to your features and look.', price:'$150', duration:'120 min', category:'skin', featured:true, image:'/services/bridal-makeup.jpg', includes:['Look consultation','Skin preparation','Bridal makeup and setting'], goodToKnow:['Book a trial before the wedding date'] },
  { id:'s18', title:'Party Makeup', description:'A complete event look with professional finishing.', price:'$85', duration:'75 min', category:'skin', image:'/services/party-makeup.jpg', includes:['Makeup consultation','Full-face makeup','Setting spray finish'], goodToKnow:['Bring inspiration photos and jewellery references'] },
  { id:'s19', title:'Eyebrow Threading', description:'Precise shaping for a clean, natural brow line.', price:'$18', duration:'20 min', category:'skin', image:'/services/eyebrow-threading.jpg', includes:['Shape consultation','Gentle threading','Soothing finish'], goodToKnow:['Avoid exfoliating the brow area beforehand'] },
  { id:'s20', title:'Waxing', description:'Smooth, precise hair removal with a soothing finish.', price:'$50', duration:'45 min', category:'skin', image:'/services/waxing.jpg', includes:['Area consultation','Professional waxing','Post-wax soothing care'], goodToKnow:['Avoid sun exposure immediately afterwards'] },
]

export const featuredServices = services.filter((service) => service.featured)

export function mockDelay(ms = 450): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function dateFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    serviceId: 's4',
    serviceTitle: 'Hair Coloring',
    date: dateFromNow(3),
    time: '10:30 AM',
    duration: '120 min',
    price: '$140',
    status: 'confirmed',
    staffName: 'Amara',
    notes: 'Bring the inspiration photo discussed at the consultation.',
  },
  {
    id: 'a2',
    serviceId: 's12',
    serviceTitle: 'Facial',
    date: dateFromNow(12),
    time: '2:00 PM',
    duration: '60 min',
    price: '$90',
    status: 'pending',
    staffName: 'Nadia',
  },
  {
    id: 'a3',
    serviceId: 's1',
    serviceTitle: "Men's Haircut",
    date: dateFromNow(-21),
    time: '11:00 AM',
    duration: '45 min',
    price: '$60',
    status: 'completed',
    staffName: 'Amara',
  },
  {
    id: 'a4',
    serviceId: 's15',
    serviceTitle: 'Pedicure',
    date: dateFromNow(-48),
    time: '4:30 PM',
    duration: '50 min',
    price: '$55',
    status: 'completed',
    staffName: 'Leila',
  },
  {
    id: 'a5',
    serviceId: 's16',
    serviceTitle: 'Head Massage',
    date: dateFromNow(-70),
    time: '1:00 PM',
    duration: '60 min',
    price: '$65',
    status: 'cancelled',
    staffName: 'Maya',
  },
]

export const mockCustomerDashboard: CustomerDashboardData = {
  stats: {
    upcoming: 2,
    completed: 2,
    visits: 4,
    favouriteCategory: 'hair',
  },
  nextAppointment: mockAppointments[0] ?? null,
  recentAppointments: mockAppointments.slice(0, 4),
}

const adminSeededCustomers = [
  { name: 'Sofia Rahman', email: 'sofia@example.com' },
  { name: 'Priya Sen', email: 'priya@example.com' },
  { name: 'Hana Ali', email: 'hana@example.com' },
  { name: 'Mariam Chowdhury', email: 'mariam@example.com' },
  { name: 'Ayesha Karim', email: 'ayesha@example.com' },
]

export const mockAdminBookings: Appointment[] = [
  ...mockAppointments.map((appointment, index) => ({
    ...appointment,
    customerName: adminSeededCustomers[index]?.name,
    customerEmail: adminSeededCustomers[index]?.email,
  })),
  {
    id: 'a6',
    serviceId: 's13',
    serviceTitle: 'Skin Care',
    date: dateFromNow(0),
    time: '9:00 AM',
    duration: '75 min',
    price: '$110',
    status: 'confirmed',
    staffName: 'Maya',
    customerName: 'Sofia Rahman',
    customerEmail: 'sofia@example.com',
  },
  {
    id: 'a7',
    serviceId: 's17',
    serviceTitle: 'Bridal Makeup',
    date: dateFromNow(0),
    time: '1:30 PM',
    duration: '90 min',
    price: '$150',
    status: 'pending',
    staffName: 'Amara',
    customerName: 'Priya Sen',
    customerEmail: 'priya@example.com',
  },
  {
    id: 'a8',
    serviceId: 's14',
    serviceTitle: 'Manicure',
    date: dateFromNow(1),
    time: '11:15 AM',
    duration: '45 min',
    price: '$40',
    status: 'confirmed',
    staffName: 'Leila',
    customerName: 'Hana Ali',
    customerEmail: 'hana@example.com',
  },
]

export const mockAdminDashboard: AdminDashboardData = {
  stats: {
    todayBookings: 8,
    pendingBookings: 3,
    confirmedBookings: 5,
    cancelledBookings: 1,
    completedBookings: 4,
    totalAppointments: mockAdminBookings.length,
    successfulPayments: 2,
    activeServices: services.length,
    totalCustomers: 128,
  },
  recentBookings: mockAdminBookings.slice(0, 5),
  recentTransactions: [],
  servicesByCategory: {
    hair: services.filter((service) => service.category === 'hair').length,
    skin: services.filter((service) => service.category === 'skin').length,
    nails: services.filter((service) => service.category === 'nails').length,
    wellness: services.filter((service) => service.category === 'wellness').length,
  },
}

export const mockCustomers: CustomerRecord[] = [
  {
    id: 'c1',
    name: 'Sofia Rahman',
    email: 'sofia@example.com',
    phone: '+880 1700 000001',
    visits: 12,
    lastVisit: dateFromNow(-6),
    joinedAt: dateFromNow(-380),
  },
  {
    id: 'c2',
    name: 'Priya Sen',
    email: 'priya@example.com',
    phone: '+880 1700 000002',
    visits: 8,
    lastVisit: dateFromNow(-14),
    joinedAt: dateFromNow(-220),
  },
  {
    id: 'c3',
    name: 'Hana Ali',
    email: 'hana@example.com',
    phone: '+880 1700 000003',
    visits: 5,
    lastVisit: dateFromNow(-2),
    joinedAt: dateFromNow(-150),
  },
  {
    id: 'c4',
    name: 'Mariam Chowdhury',
    email: 'mariam@example.com',
    phone: '+880 1700 000004',
    visits: 21,
    lastVisit: dateFromNow(-1),
    joinedAt: dateFromNow(-700),
  },
  {
    id: 'c5',
    name: 'Ayesha Karim',
    email: 'ayesha@example.com',
    phone: '+880 1700 000005',
    visits: 3,
    lastVisit: dateFromNow(-40),
    joinedAt: dateFromNow(-90),
  },
  {
    id: 'c6',
    name: 'Nusrat Jahan',
    email: 'nusrat@example.com',
    phone: '+880 1700 000006',
    visits: 16,
    lastVisit: dateFromNow(-9),
    joinedAt: dateFromNow(-500),
  },
]
