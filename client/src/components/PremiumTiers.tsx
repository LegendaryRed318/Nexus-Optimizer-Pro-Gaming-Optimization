import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    color: "border-gray-600",
    buttonClass: "border border-gray-600 text-gray-400",
    buttonText: "Current Plan",
    features: [
      "Basic optimization",
      "System monitoring",
      "3 game profiles",
      "FPS overlay"
    ],
    disabled: true
  },
  {
    name: "Enhanced",
    price: "$9.99",
    period: "/month",
    color: "border-neon-green",
    buttonClass: "bg-neon-green text-dark-bg hover:bg-neon-green/90",
    buttonText: "Upgrade Now",
    features: [
      "Advanced optimization",
      "Unlimited game profiles",
      "Auto-optimization",
      "Priority support"
    ]
  },
  {
    name: "Elite",
    price: "$19.99",
    period: "/month",
    color: "border-yellow-400",
    buttonClass: "bg-gradient-to-r from-neon-purple to-yellow-400 text-dark-bg hover:opacity-90",
    buttonText: "Go Elite",
    badge: "BEST",
    features: [
      "BIOS-level optimization",
      "Advanced network tuning",
      "Deep system tweaks",
      "Exclusive game profiles",
      "Custom themes"
    ]
  }
];

export function PremiumTiers() {
  return (
    <div className="bg-dark-card rounded-xl p-6 border border-dark-border card-hover">
      <div className="flex items-center mb-6">
        <i className="fas fa-crown text-yellow-400 text-2xl mr-4 neon-glow" />
        <div>
          <h3 className="text-xl font-bold text-white">Premium Optimization</h3>
          <p className="text-gray-400">Unlock advanced features and exclusive game profiles</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "bg-dark-bg rounded-lg p-6 border relative",
              tier.color,
              tier.name === "Enhanced" && "bg-gradient-to-br from-neon-green/10 to-neon-blue/10",
              tier.name === "Elite" && "bg-gradient-to-br from-neon-purple/10 to-yellow-400/10"
            )}
          >
            <div className="flex items-center mb-2">
              <h4 className={cn(
                "text-lg font-bold",
                tier.name === "Free" && "text-gray-300",
                tier.name === "Enhanced" && "text-neon-green",
                tier.name === "Elite" && "text-yellow-400"
              )}>
                {tier.name}
              </h4>
              {tier.badge && (
                <span className="ml-2 px-2 py-1 bg-yellow-400 text-dark-bg text-xs rounded-full font-bold">
                  {tier.badge}
                </span>
              )}
            </div>
            
            <p className="text-3xl font-bold text-white mb-4">
              {tier.price}
              <span className="text-sm text-gray-400">{tier.period}</span>
            </p>
            
            <ul className="space-y-2 text-sm text-gray-400 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <i className={cn(
                    "fas fa-check mr-2",
                    tier.name === "Free" && "text-green-400",
                    tier.name === "Enhanced" && "text-neon-green",
                    tier.name === "Elite" && "text-yellow-400"
                  )} />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Button
              className={cn("w-full py-2 transition-all duration-300", tier.buttonClass)}
              disabled={tier.disabled}
            >
              {tier.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
