module.exports = process.env.ROS_COV ? require('./lib-cov/ros') : require('./lib/ros');