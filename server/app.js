const notificationsRouter = require('./routes/notifications')
app.use('/api/notifications', notificationsRouter)

const activitiesRouter = require('./routes/activities')
app.use('/api/activities', activitiesRouter) 