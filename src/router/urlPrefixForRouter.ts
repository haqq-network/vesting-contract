
import appConstants from '../constants/appConstants';
/*
* localhost or gitlab ( '/' or '/projectName/')
* */
function urlPrefixForRouter() {
    let urlPrefix;
    const localHostUrlPrefix = '';
    const gitLabUrlPrefix = '/' + appConstants.gitlabProjectName;
    const currentUrl = window.location.href
        .toString().toLowerCase(); // it can be not in lowercase in browser window
    if (currentUrl.includes('gitlab')) {
        urlPrefix = gitLabUrlPrefix;
    } else if (currentUrl.includes('localhost')) {
        urlPrefix = localHostUrlPrefix;
    }
    return urlPrefix;
}
export default urlPrefixForRouter;

