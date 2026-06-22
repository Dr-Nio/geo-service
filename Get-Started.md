// In your TypeScript/JavaScript file
import FullyDynamicGeolocationService from '@dr-nio/geo-service';

// Or
import { FullyDynamicGeolocationService } from '@dr-nio/geo-service';

// Then use it
const service = new FullyDynamicGeolocationService();

const [ location, setLocation ] = useState<any | null>(null);
