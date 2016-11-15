import {Component} from '../lib/index';
//test
class Header extends Component {

    constructor() {
        super(...arguments);
        console.log("HEADER js")
    }

    destroy() {
        super.destroy();
    }

}