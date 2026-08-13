import { CustomLogo } from '@/components/custom/CustomLogo';

export const CustomFooter = () => {
  return (
    <footer className="border-t py-12 px-4 lg:px-8 mt-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <CustomLogo />
            <p className="text-sm text-muted-foreground">
              Clothing inspired by minimalist design and innovation.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  T-Shirts
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Sweatshirts
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Jackets
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Accessories
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Size Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Sustainability
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Press
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} An. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
